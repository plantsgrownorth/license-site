/**
 * Publish the next queued blog post.
 * Usage: node scripts/publish-next-post.js [--git]
 *
 * 1. Reads the first .md file from content/queue/ (by name order).
 * 2. Sets frontmatter date to today.
 * 3. Moves it to src/pages/blog/{filename}.
 * 4. If --git: git add, commit, push.
 *
 * Queue folder: content/queue/
 * Add finished .md posts there, then run this every 2–3 days (or use a scheduled job).
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const ROOT = path.resolve(import.meta.dirname, '..');
const QUEUE_DIR = path.join(ROOT, 'content', 'queue');
const BLOG_DIR = path.join(ROOT, 'src', 'pages', 'blog');

const doGit = process.argv.includes('--git');

function today() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

if (!fs.existsSync(QUEUE_DIR)) {
  fs.mkdirSync(QUEUE_DIR, { recursive: true });
  console.log('Created content/queue/. Add .md posts there and run this script again.');
  process.exit(0);
}

const files = fs.readdirSync(QUEUE_DIR).filter((f) => f.endsWith('.md')).sort();
if (files.length === 0) {
  console.log('No .md files in content/queue/. Add posts to publish.');
  process.exit(0);
}

const filename = files[0];
const slug = filename.replace(/\.md$/, '');
const srcPath = path.join(QUEUE_DIR, filename);
const destPath = path.join(BLOG_DIR, filename);

let content = fs.readFileSync(srcPath, 'utf8');
const dateMatch = content.match(/^date:\s*["']?([^"'\n]+)["']?/m);
if (dateMatch) {
  content = content.replace(/^date:\s*["']?[^"'\n]+["']?/m, `date: "${today()}"`);
} else {
  const frontMatterEnd = content.indexOf('---', 3);
  if (frontMatterEnd !== -1) {
    content = content.slice(0, frontMatterEnd) + `date: "${today()}"\n` + content.slice(frontMatterEnd);
  }
}

fs.writeFileSync(destPath, content);
fs.unlinkSync(srcPath);

console.log(`Published: ${slug} (date: ${today()})`);

if (doGit) {
  const relDest = path.relative(ROOT, destPath);
  const relQueue = path.relative(ROOT, QUEUE_DIR);
  execSync(`git add "${relDest}" "${relQueue}"`, { cwd: ROOT, stdio: 'inherit' });
  const title = content.match(/title:\s*["']([^"']+)["']/)?.[1] || slug;
  execSync(`git commit -m "Publish: ${title}"`, { cwd: ROOT, stdio: 'inherit' });
  execSync('git push', { cwd: ROOT, stdio: 'inherit' });
  console.log('Committed and pushed.');
}
