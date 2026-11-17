import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

// Quick-switch shortcuts for Anthropic models on Amazon Bedrock (US region).
// Add a new alias by adding a line here.
const MODEL_ALIASES: Record<string, string> = {
  model_opus_5_5: "us.anthropic.claude-opus-5-5",
  model_opus_5: "us.anthropic.claude-opus-5",
  model_sonnet_4_6: "us.anthropic.claude-sonnet-4-6",
  model_sonnet_5: "us.anthropic.claude-sonnet-5",
  model_sonnet_5_5: "us.anthropic.claude-sonnet-5-5",
  model_haiku: "us.anthropic.claude-haiku-5-5",
};

const PROVIDER = "amazon-bedrock";

export default function (pi: ExtensionAPI) {
  for (const [alias, modelId] of Object.entries(MODEL_ALIASES)) {
    pi.registerCommand(alias, {
      description: `Switch model to ${modelId}`,
      handler: async (_args, ctx) => {
        const model = ctx.modelRegistry.find(PROVIDER, modelId);
        if (!model) {
          ctx.ui.notify(
            `Model not found: ${PROVIDER}/${modelId} (catalog may need a refresh)`,
            "error",
          );
          return;
        }

        const success = await pi.setModel(model);
        if (!success) {
          ctx.ui.notify(
            `Failed to switch model: no auth configured for ${PROVIDER}`,
            "error",
          );
          return;
        }

        ctx.ui.notify(`Switched to ${modelId}`, "info");
      },
    });
  }
}
