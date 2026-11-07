import type { Metadata } from "next"
import { PlayerSheet } from "@/components/player-sheet"

export const metadata: Metadata = {
  title: "Player",
}

export default function PlayerPage() {
  return <PlayerSheet />
}
