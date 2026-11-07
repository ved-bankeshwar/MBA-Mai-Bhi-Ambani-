"use client"

import { useEffect, useState } from "react"
import { Download, FileDown, RefreshCw } from "lucide-react"
import { PageIntro } from "@/components/page-intro"
import { pageShell, SiteHeader } from "@/components/site-header"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { deckLabels, type DeckId } from "@/lib/cards"
import { installLocalDecks, markAppInstalled, useAppInstalled, useDecks } from "@/lib/deck-store"

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
  const installed = useAppInstalled()
  const [prompt, setPrompt] = useState<InstallPrompt | null>(null)
  const [synced, setSynced] = useState(false)
  const [ios, setIos] = useState(false)

  useEffect(() => {
    installLocalDecks(false)
    const browser = navigator as Navigator & { standalone?: boolean }
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      browser.standalone === true
    if (standalone) markAppInstalled()
    const apple = /iphone|ipad|ipod/i.test(navigator.userAgent)
    setIos(apple && !standalone)

    const onPrompt = (event: Event) => {
      event.preventDefault()
      setPrompt(event as InstallPrompt)
    }
    const onInstalled = () => {
      markAppInstalled()
      installLocalDecks(true)
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
    if (choice.outcome === "accepted") markAppInstalled()
    setPrompt(null)
  }

  function syncCards() {
    installLocalDecks(true)
    setSynced(true)
  }

  const total = order.reduce((sum, key) => sum + decks[key].length, 0)

  return (
    <div className="min-h-full">
      <SiteHeader eyebrow={installed ? "Sync" : "Download"} />
      <main className={`${pageShell} flex flex-col gap-4 sm:gap-5 md:gap-6`}>
        <PageIntro
          kicker={installed ? "Sync" : "Download"}
          title={installed ? "Update the cards" : "Keep MBA on this phone"}
        >
          {installed
            ? "MBA is on this phone. Sync copies the latest card files into this device. The PDF saves to your downloads."
            : "Install the game once while you are online. The card files are saved here, and the app opens again with no connection."}
        </PageIntro>
        <div className="mt-6 grid grid-cols-1 gap-3 sm:mt-8 sm:gap-4 md:mt-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] xl:gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl">
                {installed ? "Sync" : "Install"}
              </CardTitle>
              <CardDescription>
                {installed
                  ? "Bring the newest card files onto this phone."
                  : "Use the button in Chrome or Edge. On iPhone, add this page to the Home Screen."}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {installed ? (
                <Button
                  type="button"
                  size="lg"
                  className="h-11 w-full sm:h-10 sm:w-auto sm:min-w-48"
                  onClick={syncCards}
                >
                  <RefreshCw />
                  Sync cards
                </Button>
              ) : (
                <Button
                  type="button"
                  size="lg"
                  className="h-11 w-full sm:h-10 sm:w-auto sm:min-w-48"
                  onClick={install}
                >
                  <Download />
                  Install MBA
                </Button>
              )}
              <a
                href="/MBA_download.pdf"
                download="MBA_download.pdf"
                className={buttonVariants({
                  variant: "outline",
                  size: "lg",
                  className: "h-11 w-full sm:h-10 sm:w-auto sm:min-w-48",
                })}
              >
                <FileDown />
                Download PDF
              </a>
              {synced ? (
                <Alert>
                  <AlertDescription>
                    The card files on this phone are up to date.
                  </AlertDescription>
                </Alert>
              ) : null}
              {ios && !installed ? (
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
              {installed ? null : (
                <ol className="grid gap-2 text-sm text-muted-foreground sm:text-base">
                  <li>1. Tap Install MBA.</li>
                  <li>2. The card files save on this phone.</li>
                  <li>3. Open MBA from the home screen, online or offline.</li>
                </ol>
              )}
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
