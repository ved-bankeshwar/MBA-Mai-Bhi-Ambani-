import { emptyPlayer, type LedgerKey, type PlayerState } from "@/lib/types"

const STORAGE_KEY = "mba-player-v1"
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((listener) => listener())
}

export function subscribePlayer(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getPlayerSnapshot() {
  return localStorage.getItem(STORAGE_KEY) ?? ""
}

export function getServerPlayerSnapshot() {
  return ""
}

function isLineList(value: unknown): value is PlayerState["income"] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        item &&
        typeof item === "object" &&
        typeof item.id === "string" &&
        typeof item.name === "string" &&
        typeof item.amount === "number" &&
        Number.isFinite(item.amount),
    )
  )
}

export function readPlayer(raw: string): PlayerState {
  try {
    if (!raw) return emptyPlayer
    const parsed = JSON.parse(raw) as Partial<PlayerState>
    if (!isLineList(parsed.income) || !isLineList(parsed.expenses)) {
      return emptyPlayer
    }
    if (!isLineList(parsed.assets) || !isLineList(parsed.liabilities)) {
      return emptyPlayer
    }
    const totals: Partial<PlayerState["totals"]> = parsed.totals ?? {}
    const totalText = (key: LedgerKey) =>
      typeof totals[key] === "string" ? totals[key] : ""
    return {
      professionId:
        typeof parsed.professionId === "string" ? parsed.professionId : null,
      locked: parsed.locked === true && typeof parsed.professionId === "string",
      savings: typeof parsed.savings === "string" ? parsed.savings : "",
      cashflow: typeof parsed.cashflow === "string" ? parsed.cashflow : "",
      totals: {
        income: totalText("income"),
        expenses: totalText("expenses"),
        assets: totalText("assets"),
        liabilities: totalText("liabilities"),
      },
      income: parsed.income,
      expenses: parsed.expenses,
      assets: parsed.assets,
      liabilities: parsed.liabilities,
    }
  } catch {
    return emptyPlayer
  }
}

export function savePlayer(state: PlayerState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  emit()
}

export function clearPlayer() {
  localStorage.removeItem(STORAGE_KEY)
  emit()
}
