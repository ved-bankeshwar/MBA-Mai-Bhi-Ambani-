export function formatAmount(amount: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(amount)
}

export function parseAmount(raw: string) {
  const cleaned = raw.replace(/,/g, "").trim()
  if (!cleaned) return null
  const amount = Number(cleaned)
  if (!Number.isFinite(amount)) return null
  return amount
}
