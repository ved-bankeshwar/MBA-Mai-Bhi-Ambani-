"use client"

import { useState } from "react"
import { pageShell, SiteHeader } from "@/components/site-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table"
import {
  deckLabels,
  decks,
  drawCard,
  type DeckId,
} from "@/lib/cards"
import type { PresentedCard } from "@/lib/types"

const legend = [
  { mark: "♠", label: "Deals" },
  { mark: "♣", label: "Market" },
  { mark: "♦", label: "Pay Day" },
  { mark: "♥ A", label: "Baby" },
  { mark: "♥ 2", label: "Charity" },
  { mark: "♥ 3", label: "Job loss" },
  { mark: "♥ 4–10", label: "Doodad" },
]

const deckButtonClass =
  "h-auto min-h-14 w-full px-3 py-4 text-sm whitespace-normal sm:min-h-16 sm:text-base md:min-h-20 md:text-lg lg:min-h-16 xl:min-h-20 2xl:min-h-24"

export function DealerBoard() {
  const [active, setActive] = useState<DeckId | null>(null)
  const [card, setCard] = useState<PresentedCard | null>(null)

  function draw(deck: DeckId) {
    setActive(deck)
    setCard(drawCard(decks[deck]))
  }

  return (
    <div className="min-h-full">
      <SiteHeader eyebrow="Dealer" />
      <main className={pageShell}>
        <div className="grid grid-cols-1 gap-4 sm:gap-5 md:gap-6 lg:grid-cols-2 lg:items-start xl:gap-8 2xl:gap-10">
          <div className="order-2 flex flex-col gap-4 sm:gap-5 lg:order-1">
            <Card aria-live="polite">
              {card ? (
                <>
                  <CardHeader>
                    <Badge variant="secondary" className="w-fit">
                      {deckLabels[active ?? "profession"]}
                    </Badge>
                    <CardTitle className="text-xl sm:text-2xl md:text-3xl">
                      {card.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4">
                    {card.paragraphs.map((paragraph) => (
                      <CardDescription
                        key={paragraph}
                        className="text-sm text-foreground sm:text-base"
                      >
                        {paragraph}
                      </CardDescription>
                    ))}
                    {card.fields.length > 0 && (
                      <>
                        <Separator />
                        <Table>
                          <TableBody>
                            {card.fields.map((field) => (
                              <TableRow key={`${field.label}-${field.value}`}>
                                <TableCell className="whitespace-normal text-muted-foreground">
                                  {field.label}
                                </TableCell>
                                <TableCell className="text-right font-medium whitespace-normal">
                                  {field.value}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </>
                    )}
                  </CardContent>
                </>
              ) : (
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl md:text-2xl">
                    Start the game by all players picking a profession.
                  </CardTitle>
                  <CardDescription>
                    The suits below are the real cards. This screen draws the
                    deals, the market, and the doodads.
                  </CardDescription>
                </CardHeader>
              )}
            </Card>
            <div className="flex flex-wrap gap-2">
              {legend.map((item) => (
                <Badge key={item.mark} variant="outline">
                  {item.mark} {item.label}
                </Badge>
              ))}
            </div>
          </div>

          <div className="order-1 flex flex-col gap-2 sm:gap-3 md:gap-4 lg:order-2 lg:gap-3 xl:gap-4 2xl:gap-5">
            <Button
              type="button"
              size="lg"
              variant={active === "profession" ? "default" : "secondary"}
              className={deckButtonClass}
              onClick={() => draw("profession")}
            >
              Profession
            </Button>
            <div className="grid grid-cols-2 grid-rows-4 gap-2 sm:gap-3 md:gap-4 lg:gap-3 xl:gap-4 2xl:gap-5">
              <DeckButton
                deck="stocks"
                active={active}
                className="col-start-1 row-start-1"
                onDraw={draw}
              />
              <DeckButton
                deck="market"
                active={active}
                className="col-start-2 row-span-2 row-start-1"
                onDraw={draw}
              />
              <DeckButton
                deck="realty"
                active={active}
                className="col-start-1 row-start-2"
                onDraw={draw}
              />
              <DeckButton
                deck="finance"
                active={active}
                className="col-start-1 row-start-3"
                onDraw={draw}
              />
              <DeckButton
                deck="doodad"
                active={active}
                className="col-start-2 row-span-2 row-start-3"
                onDraw={draw}
              />
              <DeckButton
                deck="business"
                active={active}
                className="col-start-1 row-start-4"
                onDraw={draw}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function DeckButton({
  deck,
  active,
  className,
  onDraw,
}: {
  deck: DeckId
  active: DeckId | null
  className: string
  onDraw: (deck: DeckId) => void
}) {
  return (
    <Button
      type="button"
      size="lg"
      variant={active === deck ? "default" : "secondary"}
      className={`${className} ${deckButtonClass}`}
      onClick={() => onDraw(deck)}
    >
      {deckLabels[deck]}
    </Button>
  )
}
