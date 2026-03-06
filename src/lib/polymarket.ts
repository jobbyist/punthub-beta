export async function getBuilderSignedOrders() {
  const res = await fetch("/api/polymarket/clob/orders", {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error(`Request failed: ${res.status}`);
  }

  return res.json();
}
