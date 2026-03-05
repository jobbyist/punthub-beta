// ─── TOKEN APPROVAL UTILITIES ────────────────────────────────────────────────
// Before trading on Polymarket, the user's Safe wallet must grant approvals
// to several contracts for both USDC.e (ERC-20) and outcome tokens (ERC-1155).
//
// Required approvals
// ──────────────────
// USDC.e ERC-20 approvals (unlimited):
//   • CTF Contract
//   • CTF Exchange
//   • Neg Risk CTF Exchange
//   • Neg Risk Adapter
//
// Outcome token ERC-1155 approvals (setApprovalForAll):
//   • CTF Exchange
//   • Neg Risk CTF Exchange
//   • Neg Risk Adapter
//
// All approvals are executed in a single batch transaction via RelayClient
// (gasless for the end user). One-time setup per Safe.
//
// Reference: https://github.com/Polymarket/magic-safe-builder-example

import { ethers } from "ethers";
import {
  USDC_E_ADDRESS,
  CTF_CONTRACT_ADDRESS,
  CTF_EXCHANGE_ADDRESS,
  NEG_RISK_CTF_EXCHANGE_ADDRESS,
  NEG_RISK_ADAPTER_ADDRESS,
} from "./polymarketTrading.js";

// Minimal ABIs for encoding approval data
const ERC20_APPROVE_ABI = ["function approve(address spender, uint256 amount)"];
const ERC1155_APPROVE_ABI = ["function setApprovalForAll(address operator, bool approved)"];

const erc20Interface = new ethers.utils.Interface(ERC20_APPROVE_ABI);
const erc1155Interface = new ethers.utils.Interface(ERC1155_APPROVE_ABI);

const MAX_UINT256 = ethers.constants.MaxUint256;

// Threshold for considering an ERC-20 allowance as "approved"
const APPROVAL_THRESHOLD = ethers.BigNumber.from("1000000000000"); // 1 000 000 USDC.e (6 decimals)

// ── Build approval transactions ────────────────────────────────────────────────

/**
 * Build the full set of approval SafeTransactions needed for Polymarket trading.
 * @returns {Array<{ to: string, data: string, value: string, operation: number }>}
 */
export function createAllApprovalTxs() {
  const CALL = 0; // OperationType.Call

  const erc20Spenders = [
    CTF_CONTRACT_ADDRESS,
    CTF_EXCHANGE_ADDRESS,
    NEG_RISK_CTF_EXCHANGE_ADDRESS,
    NEG_RISK_ADAPTER_ADDRESS,
  ];

  const erc1155Operators = [
    CTF_EXCHANGE_ADDRESS,
    NEG_RISK_CTF_EXCHANGE_ADDRESS,
    NEG_RISK_ADAPTER_ADDRESS,
  ];

  const txs = [];

  // USDC.e approvals
  for (const spender of erc20Spenders) {
    txs.push({
      to: USDC_E_ADDRESS,
      operation: CALL,
      data: erc20Interface.encodeFunctionData("approve", [spender, MAX_UINT256]),
      value: "0",
    });
  }

  // Outcome token approvals
  for (const operator of erc1155Operators) {
    txs.push({
      to: CTF_CONTRACT_ADDRESS,
      operation: CALL,
      data: erc1155Interface.encodeFunctionData("setApprovalForAll", [operator, true]),
      value: "0",
    });
  }

  return txs;
}

// ── Check existing approvals ───────────────────────────────────────────────────

/**
 * Check whether the Safe already has all required approvals set.
 * Uses the Polygon public RPC to query on-chain state.
 *
 * @param {string} safeAddress
 * @returns {Promise<boolean>}
 */
export async function checkAllApprovals(safeAddress) {
  const { createPublicClient, http } = await import("viem");
  const { polygon } = await import("viem/chains");

  const rpcUrl =
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_POLYGON_RPC_URL) ||
    "https://polygon-rpc.com";

  const publicClient = createPublicClient({ chain: polygon, transport: http(rpcUrl) });

  const erc20Abi = [
    {
      name: "allowance",
      type: "function",
      stateMutability: "view",
      inputs: [
        { name: "owner", type: "address" },
        { name: "spender", type: "address" },
      ],
      outputs: [{ name: "", type: "uint256" }],
    },
  ];

  const erc1155Abi = [
    {
      name: "isApprovedForAll",
      type: "function",
      stateMutability: "view",
      inputs: [
        { name: "account", type: "address" },
        { name: "operator", type: "address" },
      ],
      outputs: [{ name: "", type: "bool" }],
    },
  ];

  const erc20Spenders = [
    CTF_CONTRACT_ADDRESS,
    CTF_EXCHANGE_ADDRESS,
    NEG_RISK_CTF_EXCHANGE_ADDRESS,
    NEG_RISK_ADAPTER_ADDRESS,
  ];

  const erc1155Operators = [
    CTF_EXCHANGE_ADDRESS,
    NEG_RISK_CTF_EXCHANGE_ADDRESS,
    NEG_RISK_ADAPTER_ADDRESS,
  ];

  try {
    const [allowances, approvals] = await Promise.all([
      Promise.all(
        erc20Spenders.map((spender) =>
          publicClient.readContract({
            address: USDC_E_ADDRESS,
            abi: erc20Abi,
            functionName: "allowance",
            args: [safeAddress, spender],
          })
        )
      ),
      Promise.all(
        erc1155Operators.map((operator) =>
          publicClient.readContract({
            address: CTF_CONTRACT_ADDRESS,
            abi: erc1155Abi,
            functionName: "isApprovedForAll",
            args: [safeAddress, operator],
          })
        )
      ),
    ]);

    const threshold = BigInt(APPROVAL_THRESHOLD.toString());
    const allErc20Approved = allowances.every((a) => BigInt(a) >= threshold);
    const allErc1155Approved = approvals.every(Boolean);

    return allErc20Approved && allErc1155Approved;
  } catch (e) {
    console.warn("[Approvals] Could not check on-chain state:", e.message);
    return false;
  }
}

// ── Ensure approvals are set ───────────────────────────────────────────────────

/**
 * Check on-chain approval status and, if needed, execute the full approval
 * batch via the RelayClient (gasless for the user).
 *
 * @param {import("@polymarket/builder-relayer-client").RelayClient} relayClient
 * @param {string} safeAddress
 */
export async function ensureTokenApprovals(relayClient, safeAddress) {
  const alreadyApproved = await checkAllApprovals(safeAddress);
  if (alreadyApproved) {
    console.log("[Approvals] All approvals already set — skipping.");
    return;
  }

  console.log("[Approvals] Setting all token approvals via RelayClient…");
  const approvalTxs = createAllApprovalTxs();
  const response = await relayClient.execute(approvalTxs, "Set all token approvals for trading");
  await response.wait();
  console.log("[Approvals] All approvals set successfully.");
}

