/**
 * Cloudflare Pages limits each deployment to 20,000 files total (HTML + assets).
 * With ~19.9k routes + shared assets we sit at the cap; we omit static HTML for
 * rows where neither median nor mean annual wage exists (nothing meaningful to show).
 */
export function hasStateOccupationDetail(occ: {
  medianAnnual?: number | null;
  meanAnnual?: number | null;
}) {
  return occ.medianAnnual != null || occ.meanAnnual != null;
}
