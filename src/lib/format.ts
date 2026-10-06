// Indian notation: lakh (1,00,000) and crore (1,00,00,000).
export function formatINRShort(value: number): string {
  if (value >= 1e7) return `₹${trim(value / 1e7)} Cr`;
  if (value >= 1e5) return `₹${trim(value / 1e5)} L`;
  return formatINR(value);
}

export function formatINR(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.round(value));
}

function trim(n: number) {
  return n >= 100 ? n.toFixed(0) : n.toFixed(2).replace(/\.?0+$/, "");
}
