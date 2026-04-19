type StateRow = {
  stateSlug: string;
  state: string;
  medianAnnual?: number | null;
  totalEmployment?: number | null;
};

type OccHub = {
  national?: {
    totalEmployment?: number | null;
    medianAnnual?: number | null;
    pct10Annual?: number | null;
    pct90Annual?: number | null;
  } | null;
  states?: StateRow[];
} | null;

type StateOcc = {
  title: string;
  medianAnnual?: number | null;
  pct10Annual?: number | null;
  pct90Annual?: number | null;
  totalEmployment?: number | null;
  locationQuotient?: number | null;
};

type StateData = {
  state: string;
  stateSlug: string;
};

const usd = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

/**
 * Returns 2–3 data-derived sentences unique to this state+occupation pair.
 * Each sentence is grounded in numeric facts; skipped if inputs are missing.
 */
export function buildNarrative(occ: StateOcc, stateData: StateData, occHub: OccHub): string[] {
  const out: string[] = [];
  const title = occ.title;

  // 1. National rank among states by median pay
  if (occHub?.states && occ.medianAnnual != null) {
    const ranked = occHub.states
      .filter((s) => s.medianAnnual != null)
      .sort((a, b) => (b.medianAnnual as number) - (a.medianAnnual as number));
    const idx = ranked.findIndex((s) => s.stateSlug === stateData.stateSlug);
    if (idx >= 0) {
      const total = ranked.length;
      const rank = idx + 1;
      const top = ranked[0];
      if (rank === 1) {
        out.push(
          `${stateData.state} pays ${title.toLowerCase()} more than any other state — its ${usd(occ.medianAnnual)} median leads all ${total} states and D.C. reporting wage data.`,
        );
      } else {
        const gap = (top.medianAnnual as number) - occ.medianAnnual;
        const gapPct = Math.round((gap / occ.medianAnnual) * 100);
        out.push(
          `${stateData.state} ranks ${ordinal(rank)} of ${total} states and D.C. for ${title.toLowerCase()} pay, trailing top-paying ${top.state} (${usd(top.medianAnnual as number)}) by ${usd(gap)} — a ${gapPct}% gap.`,
        );
      }
    }
  }

  // 2. Pay spread (P90–P10) vs national spread
  if (
    occ.pct10Annual != null &&
    occ.pct90Annual != null &&
    occHub?.national?.pct10Annual != null &&
    occHub?.national?.pct90Annual != null
  ) {
    const stateSpread = occ.pct90Annual - occ.pct10Annual;
    const natSpread = (occHub.national.pct90Annual as number) - (occHub.national.pct10Annual as number);
    const diffPct = Math.round(((stateSpread - natSpread) / natSpread) * 100);
    if (Math.abs(diffPct) >= 10) {
      const dir = diffPct > 0 ? 'wider' : 'tighter';
      out.push(
        `The 10th-to-90th percentile range runs from ${usd(occ.pct10Annual)} to ${usd(occ.pct90Annual)} — a ${usd(stateSpread)} spread, ${Math.abs(diffPct)}% ${dir} than the national ${usd(natSpread)} range.`,
      );
    }
  }

  // 3. Concentration (location quotient) — only if meaningfully off national avg
  if (occ.locationQuotient != null && Math.abs(occ.locationQuotient - 1) >= 0.2) {
    const lq = occ.locationQuotient;
    const dir = lq > 1 ? 'more' : 'less';
    const mult = lq > 1 ? lq.toFixed(2) + '×' : (1 / lq).toFixed(2) + '×';
    out.push(
      `${title} are ${dir} concentrated in ${stateData.state} than the U.S. average — a location quotient of ${lq.toFixed(2)} means the occupation's share of local jobs is ${mult} ${lq > 1 ? 'the' : 'below the'} national share.`,
    );
  }

  // 4. Employment share of national workforce (only if ≥ 1%)
  if (
    out.length < 3 &&
    occ.totalEmployment != null &&
    occHub?.national?.totalEmployment != null &&
    (occHub.national.totalEmployment as number) > 0
  ) {
    const share = (occ.totalEmployment / (occHub.national.totalEmployment as number)) * 100;
    if (share >= 1) {
      out.push(
        `${stateData.state} employs roughly ${share.toFixed(1)}% of all ${title.toLowerCase()} in the country (${new Intl.NumberFormat('en-US').format(occ.totalEmployment)} workers).`,
      );
    }
  }

  return out.slice(0, 3);
}
