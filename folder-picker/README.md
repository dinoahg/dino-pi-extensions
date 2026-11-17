# Folder Picker

Press **alt+k** to search folders and files, then insert an `@path` reference
at the editor cursor, so you can point the agent at a folder without typing
the path.

## Usage

- **alt+k** opens the picker as an overlay.
  - Type to filter. Space-separated words must all match (case-insensitive).
  - `up`/`down` to move, `enter` to insert, `esc` to cancel.
  - **alt+k** again toggles between **All** candidates and **Cwd** entries only.
- The chosen path is inserted relative to the cwd:
  - folder inside cwd → `@./src/`
  - folder outside cwd → `@../other-project/`
  - file → `@./src/index.ts`

## Candidates

In this order, without duplicates:

1. [zoxide](https://github.com/ajeetdsouza/zoxide) folders by frecency (`zoxide query -l`)
2. First-level folders under each root in `~/.pi/agent/folder-picker.json`
   (hidden folders and `node_modules` skipped)
3. Every file and folder under the cwd, via [fd](https://github.com/sharkdp/fd)
   (includes hidden files, respects `.gitignore`, skips `.git`, capped at
   20,000 entries)

## Config

`~/.pi/agent/folder-picker.json` (optional):

```json
{ "roots": ["~/projects/absolute", "~/projects/personal"] }
```

## Requirements

- `zoxide` and `fd` on `PATH` (optional: a missing tool just contributes no
  candidates). `~/.pi/agent/bin/fd` is used first if it exists.

## Install

Part of [pi-extensions](../README.md). Install the whole repo, or just this one:

```bash
pi install /path/to/pi-extensions/folder-picker
```
