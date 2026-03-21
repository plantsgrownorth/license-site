// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

/** Build time for sitemap lastmod (helps crawlers see fresh builds). */
const buildDate = new Date();

/**
 * Hint crawl priority by URL shape (Google still decides what to index).
 * - State+occupation detail URLs: highest (long-tail money pages)
 * - State or occupation hubs: high
 * - Blog, compare, core pages: medium-high
 */
function serializeSitemapItem(item) {
  try {
    const path = new URL(item.url).pathname.replace(/\/$/, '') || '/';

    item.lastmod = buildDate;

    if (path === '/') {
      item.priority = 1.0;
      item.changefreq = 'weekly';
      return item;
    }
    if (path === '/blog' || path.startsWith('/blog/')) {
      item.priority = 0.9;
      item.changefreq = 'monthly';
      return item;
    }
    // /salaries/state-slug/occupation-slug/ (exactly 3 path segments after salaries)
    if (/^\/salaries\/[^/]+\/[^/]+$/.test(path)) {
      item.priority = 0.95;
      item.changefreq = 'monthly';
      return item;
    }
    // /salaries/single-slug/ (state hub or occupation hub)
    if (/^\/salaries\/[^/]+$/.test(path)) {
      item.priority = 0.9;
      item.changefreq = 'monthly';
      return item;
    }
    if (
      path === '/compare-states' ||
      path === '/compare-occupations' ||
      path === '/sitemap' ||
      path === '/glossary' ||
      path === '/about' ||
      path === '/contact'
    ) {
      item.priority = 0.85;
      item.changefreq = 'monthly';
      return item;
    }
    item.priority = 0.7;
    item.changefreq = 'yearly';
    return item;
  } catch {
    return item;
  }
}

export default defineConfig({
  site: 'https://statewages.com',
  output: 'static',
  integrations: [
    sitemap({
      serialize: serializeSitemapItem,
    }),
  ],
});
