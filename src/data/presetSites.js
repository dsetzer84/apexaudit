// --- MOCK DATABASE & SEED DATA ---
// Pre-analyzed demo sites used by the audit engine and the sample history view.
export const PRESET_SITES = {
  'stripe.com': {
    url: 'https://stripe.com',
    title: 'Stripe | Financial Infrastructure for the Internet',
    scores: { overall: 94, seo: 96, copy: 92, speed: 90, ux: 98 },
    issues: [
      {
        type: 'warning',
        cat: 'SEO',
        title: 'Meta description length is near maximum threshold (158 chars)',
        fix: 'Trim to 140 characters to prevent mobile truncation.',
      },
      {
        type: 'critical',
        cat: 'Copy',
        title: 'H2 Subheadline lacks direct urgency trigger',
        fix: "Change 'Financial Infrastructure' to 'Scale online payments faster with unified developer APIs.'",
      },
      {
        type: 'passed',
        cat: 'Speed',
        title: 'First Contentful Paint (FCP) under 0.8s',
        fix: null,
      },
    ],
  },
  'linear.app': {
    url: 'https://linear.app',
    title: 'Linear | Purpose-built for modern software development',
    scores: { overall: 91, seo: 89, copy: 95, speed: 94, ux: 87 },
    issues: [
      {
        type: 'critical',
        cat: 'SEO',
        title: "Missing H1 keyword density for target term 'Issue Tracker'",
        fix: "Incorporate 'AI Issue Tracker' into hero title markup.",
      },
      {
        type: 'warning',
        cat: 'UX',
        title: 'Low color contrast on secondary navigation links',
        fix: 'Increase text color lightness from zinc-500 to zinc-300.',
      },
      {
        type: 'passed',
        cat: 'Copy',
        title: 'Hero value proposition readability grade is 9.2 (Optimal)',
        fix: null,
      },
    ],
  },
};

export default PRESET_SITES;
