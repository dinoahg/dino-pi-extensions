// folder-picker.ts: opt-K opens a folder/file search popup; Enter inserts "@<relative path>/" (or "@<file>") at the editor cursor.
// Candidates: zoxide (frecency) first, then first-level children of the roots in ~/.pi/agent/folder-picker.json,
// then every file and folder under the cwd (via fd, respects .gitignore)
// Example config: {"roots": ["~/projects/absolute", "~/projects/personal"]}
import { execFile } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { matchesKey, truncateToWidth } from "@earendil-works/pi-tui";

const CONFIG = path.join(homedir(), ".pi/agent/folder-picker.json");
const ROWS = 10;

const expand = (p: string) => (p === "~" || p.startsWith("~/") ? path.join(homedir(), p.slice(1)) : p);

function roots(): string[] {
	try {
		return (JSON.parse(readFileSync(CONFIG, "utf8")).roots ?? []).map(expand);
	} catch {
		return [];
	}
}

const zoxide = () =>
	new Promise<string[]>((res) =>
		execFile("zoxide", ["query", "-l"], { maxBuffer: 8 << 20 }, (e, out) => res(e ? [] : out.split("\n").filter(Boolean))),
	);

const FD = existsSync(path.join(homedir(), ".pi/agent/bin/fd")) ? path.join(homedir(), ".pi/agent/bin/fd") : "fd";
// shortcut: capped at 20000 entries so huge cwds (e.g. ~) stay fast; raise if results go missing.
const cwdEntries = (cwd: string) =>
	new Promise<string[]>((res) =>
		execFile(FD, ["--hidden", "--exclude", ".git", "--absolute-path", "--max-results", "20000"], { cwd, maxBuffer: 64 << 20 }, (e, out) =>
			res(e ? [] : out.split("\n").filter(Boolean).map((p) => p.replace(/\/$/, ""))),
		),
	);

async function candidates(cwd: string): Promise<{ all: string[]; local: string[] }> {
	const kids = roots().flatMap((r) => {
		try {
			return readdirSync(r, { withFileTypes: true })
				.filter((d) => d.isDirectory() && !d.name.startsWith(".") && d.name !== "node_modules")
				.map((d) => path.join(r, d.name));
		} catch {
			return [];
		}
	});
	const [z, local] = await Promise.all([zoxide(), cwdEntries(cwd)]);
	return { all: [...new Set([...[...z, ...kids].filter((d) => existsSync(d)), ...local])], local };
}

/** Example: cwd /a/browser-assistant, dir /a/btv -> "@../btv/"; dir /a/browser-assistant/src -> "@./src/"; file src/x.ts -> "@./src/x.ts" */
function toRef(cwd: string, dir: string): string {
	const rel = path.relative(cwd, dir);
	if (!rel) return "@./";
	let isDir = true;
	try {
		isDir = statSync(dir).isDirectory();
	} catch {}
	return `@${rel.startsWith("..") ? rel : `./${rel}`}${isDir ? "/" : ""}`;
}

export default function (pi: ExtensionAPI) {
	pi.registerShortcut("alt+k", {
		description: "Pick a folder or file and insert @path in the editor",
		handler: async (ctx) => {
			if (!ctx.hasUI) return;
			const { all, local } = await candidates(ctx.cwd);
			if (!all.length) return ctx.ui.notify(`No folders: zoxide empty and no roots in ${CONFIG}`, "warning");
			const home = homedir();
			let tuiRef: { requestRender(): void } | undefined;
			const pick = await ctx.ui.custom<string | undefined>(
				(tui, theme, _kb, done) => {
					tuiRef = tui;
					let q = "";
					let sel = 0;
					let top = 0; // first visible row; moves only when the selection leaves the window
					let cwdOnly = false; // opt-K inside the popup toggles between all candidates and cwd entries only
					const src = () => (cwdOnly ? local : all);
					const list = () => {
						const words = q.toLowerCase().split(/\s+/).filter(Boolean);
						return src().filter((d) => words.every((w) => d.toLowerCase().includes(w)));
					};
					return {
						handleInput(data: string) {
							const l = list();
							if (matchesKey(data, "escape")) return done(undefined);
							if (matchesKey(data, "return")) return done(l[sel]);
							if (matchesKey(data, "alt+k")) (cwdOnly = !cwdOnly), (sel = 0), (top = 0);
							else if (matchesKey(data, "up")) sel = Math.max(0, sel - 1);
							else if (matchesKey(data, "down")) sel = Math.min(l.length - 1, sel + 1);
							else if (matchesKey(data, "backspace")) (q = q.slice(0, -1)), (sel = 0), (top = 0);
							else if (data.length === 1 && data.charCodeAt(0) >= 32) (q += data), (sel = 0), (top = 0);
							tui.requestRender();
						},
						invalidate() {},
						render(w: number) {
							const l = list();
							if (sel < top) top = sel;
							if (sel >= top + ROWS) top = sel - ROWS + 1;
							top = Math.max(0, Math.min(top, l.length - ROWS));
							const start = top;
							const rows = l.slice(start, start + ROWS).map((d, i) => {
								const s = d.startsWith(home) ? `~${d.slice(home.length)}` : d;
								return truncateToWidth(start + i === sel ? theme.fg("accent", `› ${s}`) : `  ${s}`, w);
							});
							return [
								theme.fg("border", "─".repeat(w)),
								truncateToWidth(`${theme.fg("accent", cwdOnly ? "Cwd:" : "All:")} ${q}▏ ${theme.fg("dim", `${l.length}/${src().length}`)}`, w),
								...(rows.length ? rows : [theme.fg("dim", "  no match")]),
								theme.fg("dim", "↑↓ move · opt-k all/cwd · enter insert · esc cancel"),
								theme.fg("border", "─".repeat(w)),
							];
						},
					};
				},
				{ overlay: true },
			);
			if (pick) {
				// The paste lands in the editor but pi does not repaint it by itself; wait one tick for focus to return, then force a render.
				await new Promise((r) => setTimeout(r, 0));
				ctx.ui.pasteToEditor(toRef(ctx.cwd, pick));
				tuiRef?.requestRender();
			}
		},
	});
}
