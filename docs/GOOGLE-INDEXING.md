# Why only some pages show as “indexed” in Search Console

**You cannot force Google to index all ~20,000 URLs.** Google chooses how much to crawl and what to keep in its index (crawl budget, site quality, duplicates, etc.). New or large sites often see **dozens or hundreds** of indexed URLs at first, not the full sitemap.

**What we do on the site**

- Submit **`https://statewages.com/sitemap-index.xml`** in Search Console (you did).
- **`astro.config.mjs`** adds sitemap **`priority`**, **`changefreq`**, and **`lastmod`** so Google can prioritize important URL patterns (e.g. state+job detail pages). This is a **hint**, not a command.

**What you can do**

1. **Wait and improve the site** — Over weeks/months, indexed count usually grows as Google trusts the site and crawls more.
2. **Search Console → URL Inspection** — For a few **important** URLs, use “Request indexing.” Do not expect to do this for every page; it’s for key URLs only.
3. **Keep publishing and fixing** — Good content, fast pages, and backlinks help crawl and indexing over time.

There is no legitimate “index all URLs now” button for a normal website.
