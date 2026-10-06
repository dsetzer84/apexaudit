// Competitor data powering the /compare hub and the individual competitor
// detail pages (surfer-seo, ahrefs, semrush, clearscope, sitechecker).
export const COMPETITORS = [
  {
    slug: 'surfer-seo',
    name: 'Surfer SEO',
    tagline: 'Content editor & keyword correlation tool',
    price: '$89 / mo',
    ourPrice: '$29 / mo',
    verdict:
      'Surfer SEO excels at raw keyword frequency density, but ApexAudit AI wins on multi-modal audits, UX analysis, and real-time generative copy rewrites at 1/3 the cost.',
    features: [
      { name: 'Live Web Audit', us: true, them: true },
      { name: 'AI Copy Rewriter', us: true, them: false },
      { name: 'UX & Speed Diagnostics', us: true, them: false },
      { name: 'Keyword Density Map', us: true, them: true },
      { name: 'Unlimited Scans', us: true, them: false },
    ],
    faq: [
      {
        q: 'Is ApexAudit AI a good Surfer SEO alternative?',
        a: 'Yes. ApexAudit AI offers broader landing page optimization, including UX friction detection and automated generative copy rewrites, whereas Surfer SEO strictly focuses on keyword counts.',
      },
    ],
  },
  {
    slug: 'ahrefs',
    name: 'Ahrefs',
    tagline: 'Enterprise backlink & search intelligence suite',
    price: '$99 / mo',
    ourPrice: '$29 / mo',
    verdict:
      'Ahrefs is the undisputed king for off-page backlink intelligence, but ApexAudit AI is dramatically better for optimizing on-page conversion copy and landing page performance.',
    features: [
      { name: 'Backlink Indexing', us: false, them: true },
      { name: 'On-Page AI Fixes', us: true, them: false },
      { name: 'Conversion Rate Audit', us: true, them: false },
      { name: 'Real-time Scanner', us: true, them: true },
      { name: 'Copy Generation', us: true, them: false },
    ],
    faq: [
      {
        q: 'Ahrefs vs ApexAudit AI: Which should I choose?',
        a: 'Choose Ahrefs if you are building massive link profiles. Choose ApexAudit AI if you want to optimize your existing landing pages to convert traffic into sales.',
      },
    ],
  },
  {
    slug: 'semrush',
    name: 'Semrush',
    tagline: 'All-in-one digital marketing software',
    price: '$129 / mo',
    ourPrice: '$29 / mo',
    verdict:
      'Semrush is a large, complex tool suite. ApexAudit AI provides a laser-focused, streamlined AI audit experience designed specifically for high-converting marketing teams.',
    features: [
      { name: 'SEO Audit Engine', us: true, them: true },
      { name: 'Instant Copy Rewrite', us: true, them: false },
      { name: 'Clean Modern UI', us: true, them: false },
      { name: 'Speed Diagnostic', us: true, them: true },
      { name: 'Zero Learning Curve', us: true, them: false },
    ],
    faq: [
      {
        q: 'Can I replace Semrush with ApexAudit AI?',
        a: 'If your primary goal is optimizing landing page copy, improving speed scores, and fixing technical on-page errors, ApexAudit AI provides a faster and more affordable workflow.',
      },
    ],
  },
  {
    slug: 'clearscope',
    name: 'Clearscope',
    tagline: 'High-end content optimization platform',
    price: '$170 / mo',
    ourPrice: '$29 / mo',
    verdict:
      'Clearscope is geared toward enterprise editorial teams. ApexAudit AI delivers enterprise-grade semantic copy scoring and UX auditing at a fraction of the cost.',
    features: [
      { name: 'Content Grading', us: true, them: true },
      { name: '1-Click AI Fixes', us: true, them: false },
      { name: 'Technical SEO Scan', us: true, them: false },
      { name: 'Affordable Pricing', us: true, them: false },
      { name: 'UX Assessment', us: true, them: false },
    ],
    faq: [
      {
        q: 'Why is ApexAudit AI significantly cheaper than Clearscope?',
        a: 'We leverage modern hyper-efficient LLM inference pipelines to pass server savings directly to users, offering superior AI capabilities at $29/mo.',
      },
    ],
  },
  {
    slug: 'sitechecker',
    name: 'Sitechecker',
    tagline: 'Technical website crawler & monitoring',
    price: '$49 / mo',
    ourPrice: '$29 / mo',
    verdict:
      'Sitechecker alerts you to broken links, but ApexAudit AI actively fixes your sales copy, improves headline hooks, and boosts conversions.',
    features: [
      { name: 'Technical Crawling', us: true, them: true },
      { name: 'Generative AI Fixes', us: true, them: false },
      { name: 'Conversion Rate Audit', us: true, them: false },
      { name: 'PageSpeed Metrics', us: true, them: true },
      { name: 'Actionable Recommendations', us: true, them: true },
    ],
    faq: [
      {
        q: 'Does ApexAudit AI monitor technical SEO errors?',
        a: 'Yes! ApexAudit AI checks technical tags, performance, and accessibility while providing instant AI-generated code snippets to fix them.',
      },
    ],
  },
];

export default COMPETITORS;
