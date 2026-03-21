# Cloudflare Pages builds

## Node version

This project requires **Node 22+** (`package.json` → `engines`). Cloudflare Pages should pick up **`.nvmrc`** in the repo root.

If builds still fail, set this in **Workers & Pages → your project → Settings → Environment variables** (Production):

| Variable       | Value |
|----------------|--------|
| `NODE_VERSION` | `22`   |

Then **Retry deployment** on the failed run or push a new commit.

## Large static build (~20k pages)

The Astro build can take **many minutes** and use a lot of memory. The default `npm run build` script sets **`NODE_OPTIONS=--max-old-space-size=8192`** (via `cross-env`) so Node is less likely to exit with **JavaScript heap out of memory** on Cloudflare's Linux builders.

### 20,000 **file** limit (not page count)

Cloudflare Pages allows **at most 20,000 files** per deployment, including **every HTML file plus** `_astro` JS/CSS, `sitemap.xml`, `robots.txt`, JSON, etc. This site is sized so that **routes + assets** can exceed that cap.

**What we do in code:** static `/salaries/[state]/[occupation]/` pages are **not** generated when both **median** and **mean** annual wages are missing for that row (no useful detail page). That trims enough files to stay under the limit. Hubs still list the row; the occupation name is plain text when there is no detail URL.

If a deploy still fails:

1. Open the failed deployment and read the **full build log** (scroll to the error). "No deployment available" in the UI usually means the build **failed**; the log has the real reason (OOM, timeout, Node version, npm error, **file limit**).
2. **Retry** once (transient OOM or timeout).
3. If it always fails at the same step, use the exact error line from the log (timeout vs memory vs install vs **Pages only supports up to 20,000 files**).
4. If the log shows **build time exceeded** Cloudflare's limit, you may need a paid tier or to reduce build work; memory alone won't fix a hard timeout.

### Windows / OneDrive

If `dist/` contains odd extra files like `index-YourPCName.html` next to `index.html`, that is often **sync or file locking**, not Astro. Delete `dist/` and rebuild; do not upload a polluted `dist/` manually.

### New pages look “missing” after a good deploy

If `/blog/` or the homepage still shows **old** content:

1. **Workers & Pages → your project → Deployments** — confirm the latest commit is **Success** (not Failed).
2. **Caching → Configuration** (zone `statewages.com`) → **Purge Everything** (or purge `https://statewages.com/blog/` only).
3. Hard-refresh the browser (Ctrl+F5) or try an incognito window.

Cloudflare’s edge cache can keep HTML for a while; purging fixes stale blog lists.

## Local build on Windows

If `npm run build` fails with **EPERM** on `dist/`, OneDrive or another process may be locking `dist/`. Close the dev server, pause OneDrive sync for the folder, or delete `dist/` manually, then build again.
