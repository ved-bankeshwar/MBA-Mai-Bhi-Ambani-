"use client"

import { useEffect } from "react"
import { installLocalDecks, markAppInstalled } from "@/lib/deck-store"

export function PwaRegister() {
  useEffect(() => {
    const browser = navigator as Navigator & { standalone?: boolean }
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      browser.standalone === true

    if (standalone) {
      markAppInstalled()
      installLocalDecks(false)
    }

    if (!("serviceWorker" in navigator)) return
    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {
      // The page still works in the browser when registration is blocked.
    })

    const onInstalled = () => {
      markAppInstalled()
      installLocalDecks(true)
    }
    window.addEventListener("appinstalled", onInstalled)
    return () => window.removeEventListener("appinstalled", onInstalled)
  }, [])

  return null
}
