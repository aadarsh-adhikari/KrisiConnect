export function formatCurrency(value) {
  if (value === null || value === undefined) return "";
  const num = Number(value);
  if (Number.isNaN(num)) return String(value);
  return `NPR ${num.toLocaleString()}`;
}
