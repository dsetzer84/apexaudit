import { useEffect } from 'react';
import { COMPETITORS } from '../data/competitors.js';

/**
 * Injects JSON-LD structured data (@graph of Product + FAQPage + BreadcrumbList)
 * into <head> whenever a competitor detail page is active.
 *
 * The route is derived from the current pathname (react-router `useLocation`),
 * so the BreadcrumbList always reflects the URL the visitor is actually on.
 */
export function useSchema(pathname) {
  useEffect(() => {
    const match = /^\/compare\/([^/]+)\/?$/.exec(pathname || '');
    const slug = match ? match[1] : null;

    if (slug) {
      const comp = COMPETITORS.find((c) => c.slug === slug);
      if (comp) {
        const schemaData = {
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'Product',
              name: 'ApexAudit AI',
              description:
                'Instant website, SEO, speed, and conversion copy auditor.',
              offers: {
                '@type': 'Offer',
                price: '29.00',
                priceCurrency: 'USD',
              },
            },
            {
              '@type': 'FAQPage',
              mainEntity: comp.faq.map((item) => ({
                '@type': 'Question',
                name: item.q,
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: item.a,
                },
              })),
            },
            {
              '@type': 'BreadcrumbList',
              itemListElement: [
                {
                  '@type': 'ListItem',
                  position: 1,
                  name: 'Home',
                  item: 'https://apexaudit.ai/',
                },
                {
                  '@type': 'ListItem',
                  position: 2,
                  name: 'Comparisons',
                  item: 'https://apexaudit.ai/compare',
                },
                {
                  '@type': 'ListItem',
                  position: 3,
                  name: `ApexAudit vs ${comp.name}`,
                  item: `https://apexaudit.ai/compare/${comp.slug}`,
                },
              ],
            },
          ],
        };
        let script = document.getElementById('jsonld-schema');
        if (!script) {
          script = document.createElement('script');
          script.id = 'jsonld-schema';
          script.type = 'application/ld+json';
          document.head.appendChild(script);
        }
        script.textContent = JSON.stringify(schemaData);
        return;
      }
    }

    // No competitor detail route is active — remove any JSON-LD left over from
    // a previous route so structured data never leaks between pages.
    const stale = document.getElementById('jsonld-schema');
    if (stale) stale.remove();
  }, [pathname]);
}

export default useSchema;
