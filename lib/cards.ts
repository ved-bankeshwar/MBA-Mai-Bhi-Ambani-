import professionsJson from "@/data/professions.json"
import stocksJson from "@/data/stocks.json"
import realtyJson from "@/data/realty.json"
import financeJson from "@/data/finance.json"
import businessJson from "@/data/business.json"
import marketJson from "@/data/market.json"
import doodadsJson from "@/data/doodads.json"
import type { GameCard, PresentedCard } from "@/lib/types"

export const decks = {
  profession: professionsJson as GameCard[],
  stocks: stocksJson as GameCard[],
  realty: realtyJson as GameCard[],
  finance: financeJson as GameCard[],
  business: businessJson as GameCard[],
  market: marketJson as GameCard[],
  doodad: doodadsJson as GameCard[],
}

export const deckLabels = {
  profession: "Profession",
  stocks: "Stocks",
  realty: "Realty",
  finance: "Finance",
  business: "Business",
  market: "Market",
  doodad: "Doodad",
} as const

export type DeckId = keyof typeof decks

export type Decks = typeof decks

export function professionById(source: Decks, id: string | null) {
  if (!id) return null
  return source.profession.find((card) => card.id === id) ?? null
}

export function presentCard(card: GameCard): PresentedCard {
  const roll =
    card.rolls && card.rolls.length > 0
      ? card.rolls[Math.floor(Math.random() * card.rolls.length)]
      : null

  const fields = [...(roll?.fields ?? []), ...card.fields].filter(
    (field) => field.value.trim() !== "",
  )

  return {
    id: card.id,
    title: card.title,
    fields,
    paragraphs: roll?.paragraphs?.length ? roll.paragraphs : card.paragraphs,
  }
}

export function drawCard(cards: GameCard[]): PresentedCard | null {
  if (cards.length === 0) return null
  const card = cards[Math.floor(Math.random() * cards.length)]
  return presentCard(card)
}
