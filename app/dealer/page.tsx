import type { Metadata } from "next"
import { DealerBoard } from "@/components/dealer-board"

export const metadata: Metadata = {
  title: "Dealer",
}

export default function DealerPage() {
  return <DealerBoard />
}
