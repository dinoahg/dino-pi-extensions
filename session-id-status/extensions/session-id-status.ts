import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";

export default function (pi: ExtensionAPI) {
	const update = (ctx: ExtensionContext) => {
		if (!ctx.hasUI) return;
		const id = ctx.sessionManager.getSessionId().slice(0, 8);
		const name = ctx.sessionManager.getSessionName();
		ctx.ui.setStatus("session-id", ctx.ui.theme.fg("dim", name ? `${name} · ${id}` : id));
	};
	pi.on("session_start", (_e, ctx) => update(ctx));
	pi.on("session_info_changed", (_e, ctx) => update(ctx));
	pi.on("session_tree", (_e, ctx) => update(ctx));
}
