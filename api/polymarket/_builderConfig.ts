import { BuilderConfig } from "@polymarket/builder-signing-sdk";

export const builderConfig = new BuilderConfig({
  remoteBuilderConfig: {
    url: "/api/polymarket/sign",
  },
});
