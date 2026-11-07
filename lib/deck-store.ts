"use client"

import { useMemo, useSyncExternalStore } from "react"
import { decks as bundledDecks, type Decks } from "@/lib/cards"
import type { GameCard } from "@/lib/types"

export const DECKS_KEY = "mba-decks-v1"

const deckKeys = [
  "profession",
  "stocks",
  "realty",
  "finance",
  "business",
  "market",
  "doodad",
] as const

const bundledSnapshot = JSON.stringify(bundledDecks)
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((listener) => listener())
}

function isCard(value: unknown): value is GameCard {
  if (!value || typeof value !== "object") return false
  const card = value as GameCard
  return (
    typeof card.id === "string" &&
    typeof card.title === "string" &&
    Array.isArray(card.fields) &&
    Array.isArray(card.paragraphs)
  )
}

function isDecks(value: unknown): value is Decks {
  if (!value || typeof value !== "object") return false
  const record = value as Record<string, unknown>
  return deckKeys.every(
    (key) => Array.isArray(record[key]) && record[key].every(isCard),
  )
}

export function subscribeDecks(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function readStored(raw: string): Decks | null {
  const parsed = JSON.parse(raw) as { v?: number; decks?: unknown }
  if (parsed?.v === 1 && isDecks(parsed.decks)) return parsed.decks
  return null
}

export function getDecksSnapshot() {
  try {
    const stored = localStorage.getItem(DECKS_KEY)
    if (!stored || !readStored(stored)) return bundledSnapshot
    return stored
  } catch {
    return bundledSnapshot
  }
}

export function getServerDecksSnapshot() {
  return bundledSnapshot
}

export function decksAreLocal() {
  try {
    const stored = localStorage.getItem(DECKS_KEY)
    return stored != null && readStored(stored) != null
  } catch {
    return false
  }
}

export function installLocalDecks(force = false) {
  if (!force && decksAreLocal()) return
  localStorage.setItem(
    DECKS_KEY,
    JSON.stringify({ v: 1, decks: bundledDecks }),
  )
  emit()
}

export function readDecks(snapshot: string): Decks {
  if (snapshot === bundledSnapshot) return bundledDecks
  try {
    return readStored(snapshot) ?? bundledDecks
  } catch {
    return bundledDecks
  }
}

export function useDecks() {
  const snapshot = useSyncExternalStore(
    subscribeDecks,
    getDecksSnapshot,
    getServerDecksSnapshot,
  )
  const decks = useMemo(() => readDecks(snapshot), [snapshot])
  const local = snapshot !== bundledSnapshot
  return { decks, local }
}
