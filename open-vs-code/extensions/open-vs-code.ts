import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

export default function (pi: ExtensionAPI) {
  pi.registerShortcut("alt+x", {
    description: "Open VSCode with the current project path",
    handler: async (ctx) => {
      const target = ctx.cwd;
      const result = await pi.exec("code", [target], { cwd: ctx.cwd });
      if (result.code !== 0) {
        ctx.ui.notify(`Could not open VSCode: ${(result.stderr || result.stdout).trim()}`, "error");
        return;
      }
      ctx.ui.notify(`Opened VSCode: ${target}`, "info");
    },
  });
}
