# Cloudflare Pages builds

## Node version

This project requires **Node 22+** (`package.json` → `engines`). Cloudflare Pages should pick up **`.nvmrc`** in the repo root.

If builds still fail, set this in **Workers & Pages → your project → Settings → Environment variables** (Production):

| Variable       | Value |
|----------------|--------|
| `NODE_VERSION` | `22`   |

Then **Retry deployment** on the failed run or push a new commit.

## Large static build (~20k pages)

The Astro build can take **many minutes** and use a lot of memory. If a deploy fails:

1. Open the failed deployment and read the **full build log** (scroll to the error).
2. **Retry** once (transient OOM or timeout).
3. If it always fails at the same step, paste the log into an issue or ask for help with the exact error line.

## Local build on Windows

If `npm run build` fails with **EPERM** on `dist/`, OneDrive or another process may be locking `dist/`. Close the dev server, pause OneDrive sync for the folder, or delete `dist/` manually, then build again.
