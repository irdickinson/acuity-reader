# Dev Baseline (Known-Good)

## Date
- 2026-01-12

## Branch / Commit
- Branch: feat/extraction-module
- Baseline snapshot commit: <fill after commit>

## Environment
- OS: Windows 11
- Node: <run `node -v`>
- pnpm: <run `pnpm -v`>

## Known-Good Commands


## Expected:
- Vite dev server starts on http://127.0.0.1:5173
- Electron launches a window
- HMR works when editing renderer code

## Typecheck
- pnpm -C apps/desktop typecheck

## Lint
- pnpm -C apps/desktop lint

## Notes
- apps/desktop is "type": "module"
- Electron entry: apps/desktop/dist-electron/main.js
- Do not change ESM/CJS settings until reader extraction core is validated in pure Node.

### Desktop dev
```bash
pnpm -C apps/desktop dev

