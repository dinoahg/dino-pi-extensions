# Model Switch

Slash commands to quick-switch between Anthropic models on Amazon Bedrock
(US region).

## Usage

| Command | Model |
|---|---|
| `/model_opus_5_5` | `us.anthropic.claude-opus-5-5` |
| `/model_opus_5` | `us.anthropic.claude-opus-5` |
| `/model_sonnet_5_5` | `us.anthropic.claude-sonnet-5-5` |
| `/model_sonnet_5` | `us.anthropic.claude-sonnet-5` |
| `/model_sonnet_4_6` | `us.anthropic.claude-sonnet-4-6` |
| `/model_haiku` | `us.anthropic.claude-haiku-5-5` |

You get an error notification if the model isn't in pi's catalog or if
`amazon-bedrock` has no auth configured.

## Adding a model

Add a line to `MODEL_ALIASES` in `extensions/model-switch.ts`
(`command_name: "bedrock-model-id"`), then `/reload`.

## Requirements

- pi's `amazon-bedrock` provider configured with credentials.

## Install

Part of [dino-pi-extensions](../README.md). Install the whole repo, or just this one:

```bash
pi install /path/to/dino-pi-extensions/model-switch
```
