// The addresses from the old website, and where each one now lives. The host sends visitors and search engines
// to the new page with a permanent (301) redirect, so the old pages' standing in search carries over.
export const OLD_ADDRESSES = [
  ['/new-here', '/plan-your-visit'], ['/visit', '/plan-your-visit'], ['/next-steps', '/plan-your-visit'], ['/faq', '/plan-your-visit'],
  ['/about-us', '/about'], ['/beliefs', '/about'], ['/stories', '/about'],
  ['/sermons', '/messages'], ['/podcasts', '/shine'],
  ['/ministries', '/discipleship'], ['/table-groups', '/discipleship'], ['/serve', '/discipleship'],
  ['/kids', '/plan-your-visit'], ['/youth', '/plan-your-visit'], ['/worship-team', '/plan-your-visit'],
  ['/prayer', '/contact'], ['/transforming-together', '/growth-campaign'], ['/capital-campaign', '/growth-campaign'], ['/team', '/leadership'],
  ['/careportal', '/'], ['/outreach', '/'],
];

export const redirectRules = (fallback) => [
  ...OLD_ADDRESSES.map(([from, to]) => `${from}    ${to}    301`),
  ...OLD_ADDRESSES.map(([from, to]) => `${from}/    ${to}    301`),
  `/*    ${fallback}   200`,
  '',
].join('\n');
