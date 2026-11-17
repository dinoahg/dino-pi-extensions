# pi-extensions

My [pi](https://pi.dev) extensions. The repo root is a pi package that loads every `*/extensions` folder; each folder is also a package on its own.

| Extension | What it does |
|---|---|
| [pi-load-skills](pi-load-skills/) | Load skills on demand from any path (`/load-skills`), session-scoped. Fork of [bnenu/pi-load-skill](https://github.com/bnenu/pi-load-skill). |
| [folder-picker](folder-picker/) | `alt+k` picker that inserts `@<path>` for folders (zoxide + roots in `~/.pi/agent/folder-picker.json`) and cwd files. |
| [model-switch](model-switch/) | `/model_*` commands to quick-switch Anthropic models on Amazon Bedrock. |
| [open-vs-code](open-vs-code/) | `alt+x` opens the cwd in VS Code. |
| [prompt-snippets](prompt-snippets/) | `alt+s` / `/snippets` toggles markdown snippets prepended/appended to prompts. |
| [session-id-status](session-id-status/) | Shows the session name and short id in the status bar. |

## Install

```bash
# All extensions, from this local clone (loaded in place: edit, then /reload — no reinstall)
pi install ~/projects/my-projects/pi-extensions

# One extension
pi install ~/projects/my-projects/pi-extensions/pi-load-skills

# On another machine, from git (update later with: pi update --extensions)
pi install git:github.com/dinoahg/pi-extensions
```

To load only some extensions from the whole-repo package, use the object form in `~/.pi/agent/settings.json` (or toggle them in `pi config`):

```json
{
  "packages": [
    {
      "source": "git:github.com/dinoahg/pi-extensions",
      "extensions": ["pi-load-skills/extensions/*.ts", "folder-picker/extensions/*.ts"]
    }
  ]
}
```

## Adding an extension

Create `<name>/extensions/<name>.ts` (or `<name>/extensions/index.ts` with its files next to it). The root glob picks it up; run `/reload`. Add a `package.json` only when the extension needs tests or dependencies (see `pi-load-skills`). pi does not run `npm install` for local packages, so install runtime dependencies yourself.

Don't keep a copy in `~/.pi/agent/extensions/` too, or it loads twice.
