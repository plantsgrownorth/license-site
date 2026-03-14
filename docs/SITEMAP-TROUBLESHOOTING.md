# Sitemap "Couldn't fetch" in Google Search Console

Google reports **Couldn't fetch** for `https://statewages.com/sitemap-index.xml` when it can't reach that URL on your live site. The sitemap **is** generated correctly when you run `npm run build` (it ends up in `dist/sitemap-index.xml`). So the fix is making sure the live site serves it.

## 1. Confirm the URL on the live site

Open in a browser (or incognito):

**https://statewages.com/sitemap-index.xml**

- If you see **XML** (a sitemap index with a link to `sitemap-0.xml`): the file is live. Wait for Google to recrawl (or use “Request indexing” for that URL in Search Console). The error may clear in 1–2 days.
- If you get **404** or **Page not found**: the host isn’t serving the file. Continue below.

## 2. If you get 404: check your deployment

The build output that must be deployed is the **contents of the `dist/` folder** (after `npm run build`). The sitemap is at the **root** of that folder:

- `dist/sitemap-index.xml`
- `dist/sitemap-0.xml` (and possibly more)

So the live site root must serve these files.

**Cloudflare Pages**

- **Build command:** `npm run build`
- **Build output directory:** `dist`
- Trigger a new deploy from the dashboard (or push a commit) so the latest build (including `sitemap-index.xml`) is deployed.

**Other hosts (Vercel, Netlify, etc.)**

- Set the **output / publish directory** to `dist` (or whatever directory contains `sitemap-index.xml` after your build).
- Ensure the build runs on deploy (`npm run build` or `astro build`). Then redeploy.

## 3. After fixing deployment

1. Open https://statewages.com/sitemap-index.xml again and confirm you see XML.
2. In Search Console, open **Sitemaps** and click **Resubmit** or re-add `https://statewages.com/sitemap-index.xml`.
3. Optionally use **URL Inspection** for `https://statewages.com/sitemap-index.xml` and choose **Request indexing**.

Once the URL is reachable, status should change from “Couldn’t fetch” to “Success” and discovered pages will start to appear over time.
