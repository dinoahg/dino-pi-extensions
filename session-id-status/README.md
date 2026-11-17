# Session ID Status

Shows the current session in pi's status bar: the first 8 characters of the
session id, prefixed by the session name when it has one
(e.g. `my-feature · 01a1e780`).

## Usage

Nothing to do. The status updates on session start, when the session is
renamed, and on `/tree` navigation. Handy for finding the session file
later or resuming with `pi --session <id>`.

## Install

Part of [pi-extensions](../README.md). Install the whole repo, or just this one:

```bash
pi install /path/to/pi-extensions/session-id-status
```
