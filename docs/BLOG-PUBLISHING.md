# Blog publishing: 2–4 day schedule (weighted ~2.5–3 days)

You can speed this up in two ways: **publish from a queue** (manual or automated) and **generate from PDFs** in Cursor so articles are ready to queue.

---

## 1. Queue + publish script (manual or automated)

**Idea:** Keep finished articles in a queue. Every 2–4 days (with more weight on 2.5–3 days), “publish” the next one: move it into the blog, set its date to today, then commit and push.

**Setup**

- Queue folder: `content/queue/`
- Add ready-to-go `.md` posts there (same frontmatter and format as `src/pages/blog/*.md`).
- Run the publish script when you want the next post to go live.

**Commands**

```bash
# Publish the next post (move to blog, set date to today). No git.
node scripts/publish-next-post.js

# Publish and commit + push
node scripts/publish-next-post.js --git
```

**Manual schedule:** Run `node scripts/publish-next-post.js --git` every 2–3 days (or use a calendar reminder). That’s enough to get a “human” cadence.

**Automated schedule (GitHub Action):** Run the same script on a schedule and only publish when “next publish date” has been reached, with 2–4 day gaps (weighted toward 2.5–3 days).

- Keep a file `content/queue/NEXT_PUBLISH.txt` containing a single line: the next publish date (YYYY-MM-DD).
- When you add new posts to `content/queue/`, set that date (e.g. “today + 3 days”). Optionally use a small helper:

  ```bash
  node -e "
  const d = new Date();
  const days = [2, 2.5, 3, 3, 3, 3.5, 4];
  const add = days[Math.floor(Math.random() * days.length)];
  d.setDate(d.getDate() + add);
  require('fs').writeFileSync('content/queue/NEXT_PUBLISH.txt', d.toISOString().slice(0,10));
  console.log('Next publish:', d.toISOString().slice(0,10));
  "
  ```

- In the Action: run daily (e.g. at a fixed time). If `today >= NEXT_PUBLISH.txt` and there is at least one `.md` in `content/queue/`, run `node scripts/publish-next-post.js --git`, then update `NEXT_PUBLISH.txt` to today + random 2–4 days (same weighted list as above) and commit that file.

That gives you roughly one article every 2–4 days with more 2.5–3 day gaps.

---

## 2. Generate articles from PDFs in Cursor

**Idea:** You still create the “source” (e.g. PDF) and Cursor turns it into a blog post. To make that faster:

- Put the PDF (or a `.md` export) in a known place (e.g. a `pdfs/` or `content/sources/` folder).
- In Cursor, use a rule or a short prompt that encodes:
  - “Use BlogLayout, this title/description, no 2026 in title/description, date YYYY-MM-DD.”
  - “Add internal links from `docs/statewages-url-list.txt` for states and occupations.”
  - “Replace BLS with federal survey / most current data; no em dashes.”
- Run that once per PDF; drop the output into `content/queue/` (or straight into `src/pages/blog/` if you prefer to publish immediately).

You don’t get “AI writes an article from scratch every 2 days” that way, but you get **one ready-to-publish article every 2–4 days** by (1) generating from a PDF whenever you have one, and (2) publishing from the queue on a 2–4 day schedule (manual or automated).

---

## Summary

| Goal | Approach |
|------|----------|
| Publish one post every 2–4 days (weighted 2.5–3) | Queue in `content/queue/` + `node scripts/publish-next-post.js --git` on a 2–3 day reminder, or GitHub Action that only runs the script when `today >= NEXT_PUBLISH.txt`. |
| Have enough articles to publish that often | Generate from PDFs in Cursor (or any pipeline) into `content/queue/`; set `NEXT_PUBLISH.txt` when you add posts so the Action knows when to publish next. |

The script doesn’t generate content; it only moves the next queued post into the blog and sets its date. Generation stays in Cursor (or your PDF→markdown step); scheduling is queue + script + optional Action.
