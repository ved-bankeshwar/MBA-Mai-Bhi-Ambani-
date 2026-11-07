export type CardField = {
  label: string
  value: string
}

export type CardRoll = {
  fields: CardField[]
  paragraphs: string[]
}

export type GameCard = {
  id: string
  title: string
  fields: CardField[]
  paragraphs: string[]
  rolls?: CardRoll[]
}

export type PresentedCard = {
  id: string
  title: string
  fields: CardField[]
  paragraphs: string[]
}

export type LineItem = {
  id: string
  name: string
  amount: number
}

export type LedgerKey = "income" | "expenses" | "assets" | "liabilities"

/**
 * One player's sheet, stored on that phone.
 * A later shared room can sync this object without changing the sheet itself.
 */
export type PlayerState = {
  professionId: string | null
  locked: boolean
  savings: string
  cashflow: string
  totals: Record<LedgerKey, string>
  income: LineItem[]
  expenses: LineItem[]
  assets: LineItem[]
  liabilities: LineItem[]
}

export const emptyPlayer: PlayerState = {
  professionId: null,
  locked: false,
  savings: "",
  cashflow: "",
  totals: { income: "", expenses: "", assets: "", liabilities: "" },
  income: [],
  expenses: [],
  assets: [],
  liabilities: [],
}
