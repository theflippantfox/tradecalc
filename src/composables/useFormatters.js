export function useFormatters() {
  const fmtINR = (n) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0)

  const fmt = (n, d = 2) =>
    new Intl.NumberFormat('en-IN', { minimumFractionDigits: d, maximumFractionDigits: d }).format(n || 0)

  const fmtK = (n) => {
    const a = Math.abs(n || 0)
    if (a >= 1e7) return `₹${(n / 1e7).toFixed(2)}Cr`
    if (a >= 1e5) return `₹${(n / 1e5).toFixed(1)}L`
    if (a >= 1e3) return `₹${(n / 1e3).toFixed(1)}K`
    return `₹${(n || 0).toFixed(0)}`
  }

  const fmtPct = (n, d = 2) => `${n >= 0 ? '+' : ''}${fmt(n, d)}%`

  return { fmtINR, fmt, fmtK, fmtPct }
}
