const plnFormatter = new Intl.NumberFormat('pl-PL', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatPLN(value) {
  const v = Number(value || 0);
  return `${plnFormatter.format(v)} zł`;
}
