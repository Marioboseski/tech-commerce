// Always 2 decimals (e.g. "4.799,97 €", "9,90 €"), so totals match the
// database exactly.
export const money = (value: number) =>
  new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

// "2026-11-11T16:03:23.549Z" → "11 Nov 2026"
export const formatDate = (isoDate: string) =>
  new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(isoDate));
