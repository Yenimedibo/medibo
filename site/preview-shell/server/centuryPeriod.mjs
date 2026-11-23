/** Neutral chronological grouping, not an assertion about cultural/imperial periods. */
export function centuryPeriod(year) {
  if (!Number.isSafeInteger(year) || year < 500 || year > 2026) return 'Unclassified';
  const century = Math.ceil(year / 100);
  const lastTwo = century % 100;
  const suffix = lastTwo >= 11 && lastTwo <= 13 ? 'th'
    : century % 10 === 1 ? 'st'
    : century % 10 === 2 ? 'nd'
    : century % 10 === 3 ? 'rd' : 'th';
  return `${century}${suffix} century CE`;
}
