"use client"

import { useEffect, useState } from "react"
import { pageShell, SiteHeader } from "@/components/site-header"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { deckLabels, type DeckId } from "@/lib/cards"
import { installLocalDecks, useDecks } from "@/lib/deck-store"

type InstallPrompt = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

const order: DeckId[] = [
  "profession",
  "stocks",
  "realty",
  "finance",
  "business",
  "market",
  "doodad",
]

export function DownloadPanel() {
  const { decks, local } = useDecks()
  const [prompt, setPrompt] = useState<InstallPrompt | null>(null)
  const [installed, setInstalled] = useState(false)
  const [ios, setIos] = useState(false)

  useEffect(() => {
    installLocalDecks(false)
    const browser = navigator as Navigator & { standalone?: boolean }
    setInstalled(
      window.matchMedia("(display-mode: standalone)").matches ||
        browser.standalone === true,
    )
    const apple = /iphone|ipad|ipod/i.test(navigator.userAgent)
    setIos(apple && browser.standalone !== true)

    const onPrompt = (event: Event) => {
      event.preventDefault()
      setPrompt(event as InstallPrompt)
    }
    const onInstalled = () => {
      installLocalDecks(true)
      setInstalled(true)
      setPrompt(null)
    }
    window.addEventListener("beforeinstallprompt", onPrompt)
    window.addEventListener("appinstalled", onInstalled)
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt)
      window.removeEventListener("appinstalled", onInstalled)
    }
  }, [])

  async function install() {
    installLocalDecks(true)
    if (!prompt) return
    await prompt.prompt()
    const choice = await prompt.userChoice
    if (choice.outcome === "accepted") setInstalled(true)
    setPrompt(null)
  }

  const total = order.reduce((sum, key) => sum + decks[key].length, 0)

  return (
    <div className="min-h-full">
      <SiteHeader eyebrow="Download" />
      <main className={`${pageShell} flex flex-col gap-4 sm:gap-5 md:gap-6`}>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
            Download MBA
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base md:text-lg">
            Install the game on this phone. The card files are copied into this
            device, and the app opens again without an internet connection.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] xl:gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl">Install</CardTitle>
              <CardDescription>
                {installed
                  ? "MBA is already installed on this device."
                  : "Use the button in Chrome or Edge. On iPhone, add this page to the Home Screen."}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Button
                type="button"
                size="lg"
                className="h-auto w-full sm:w-auto sm:min-w-48"
                onClick={install}
              >
                {installed ? "Save the card files again" : "Install MBA"}
              </Button>
              {ios ? (
                <Alert>
                  <AlertDescription>
                    In Safari, tap Share, then Add to Home Screen. Open MBA
                    from the icon. The cards stay on this phone.
                  </AlertDescription>
                </Alert>
              ) : null}
              {!prompt && !installed && !ios ? (
                <Alert>
                  <AlertDescription>
                    If the browser does not offer Install, open the menu and
                    choose Install app or Add to Home Screen.
                  </AlertDescription>
                </Alert>
              ) : null}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl">On this device</CardTitle>
              <CardDescription>
                {local
                  ? `${total} cards are stored in this browser.`
                  : "The card files are not stored here yet."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-1">
                {order.map((key) => (
                  <li key={key} className="flex items-center justify-between gap-3">
                    <span>{deckLabels[key]}</span>
                    <span className="font-medium">{decks[key].length}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
