# StateWages — Feature ideas & improvements

Ideas to make the site better and more usable. Mix of improvements to current features and new features.

---

## New features

- **Compare two states** — Side-by-side view: pick State A and State B, see the same occupation list with both medians and a difference column. Helps answer “Should I move to X or Y for this job?”

- **Compare two occupations** — Same idea: pick two occupations, see pay and employment across all states in one table. Useful for career pivots.

- **“What can I earn in [state]?”** — Funnel: choose state first, then browse or search occupations. Good for people who already know their location.

- **Percentile calculator** — User enters a salary and occupation (and optionally state). Show “You’re at roughly the Xth percentile.” Helps interpret “am I underpaid?”

- **Export to CSV** — Button on state hub and occupation hub (and detail tables) to download the current table as CSV for spreadsheets.

- **Bookmarks / saved list** — Let users save favorite states or occupations (localStorage or account later). “My saved” page to revisit.

- **Occupation search with autocomplete** — Search box in header or hero: type a few letters, get matching occupations with links. Faster than scrolling the full list.

- **State ranking for an occupation** — e.g. “Top 10 states by median pay for Registered Nurses” with a simple ranked table and link to each state’s detail.

- **Occupation ranking for a state** — e.g. “Top 20 highest-paying occupations in California” on the state hub or a dedicated section.

- **Cost-of-living adjusted view** — Optional toggle or separate view: adjust salaries by regional price parity so “real” purchasing power is comparable across states. Data source would need to be chosen (e.g. BEA RPP).

- **Email or notify when data updates** — Let users subscribe (email or push) for “data updated” for a state or occupation. Builds return visits.

- **API for developers** — Read-only API (e.g. by state slug, occupation slug) so other sites or tools can pull salary data. Optional API key for rate limiting.

- **PWA / installable** — Add manifest and service worker so the site can be “installed” on mobile and work offline for previously viewed pages.

- **Related occupations** — On occupation detail: “Similar pay” or “Often compared” (e.g. LPN vs RN vs NP) with links to those occupation hubs.

- **Career path view** — e.g. “From LPN to RN to NP” with median pay and links. Helps people see progression and pay steps.

- **Glossary** — Page or expandable tooltips: median, 10th/90th percentile, SOC code, NAICS, “most current release,” etc. Builds trust and clarity.

- **HTML sitemap** — Simple page listing all states and all occupations with links. Good for users and SEO.

- **Share buttons** — “Share this state” / “Share this occupation” (copy link, or native share on mobile) on hub and detail pages.

---

## Improvements to current features

- **Better meta descriptions per page** — Unique, concise meta description for each state hub, occupation hub, and detail page (e.g. “Median salary for Registered Nurses in California: $125,000. See percentiles and employment.”). Improves SEO and click-through.

- **Schema for salary data** — Add JSON-LD (e.g. Occupation, salary range) where it fits so rich results can show salary in search.

- **Skip link** — “Skip to main content” at the top for keyboard and screen reader users.

- **Focus states** — Visible focus ring on all interactive elements (links, buttons, inputs) for keyboard users.

- **Reduced motion** — Respect `prefers-reduced-motion` for animations and transitions.

- **Lazy load homepage grids** — Defer loading state/occupation list content until in view to speed initial load (e.g. intersection observer).

- **Methodology in one place** — Single “How we calculate” or “Methodology” section (or page) that explains data source, date, median vs mean, and limitations. Link from About and from footers.

- **FAQ page** — Short answers to: Where does the data come from? How often is it updated? Why do other sites show different numbers? What’s median vs average?

- **Breadcrumbs with category** — If we ever group occupations (e.g. Healthcare, Tech), show category in breadcrumbs on occupation pages.

- **Print styles** — Print-friendly CSS: hide nav/footer, expand tables, clear page breaks so salary tables print well.

- **Clear “last updated” on data** — Show “Data from [release date]” or “Updated [date]” on hubs and detail pages so users know how fresh the numbers are.

---

## Optional / later

- **Dark mode** — Toggle or system preference for dark theme.
- **Multi-language** — If we ever target non-English (e.g. Spanish), structure content and URLs for i18n.
- **User accounts** — Only if we add bookmarks, alerts, or API keys; not required for core value.

Use this list to prioritize; many of the “improvements” are quick wins (meta, skip link, focus, print), while “compare” and “search” are high-impact new features.
