"use client"

import { useState } from "react"
import Link from "next/link"
import { Download, RefreshCw } from "lucide-react"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { installLocalDecks, useAppInstalled } from "@/lib/deck-store"

export function HomeSetup() {
  const installed = useAppInstalled()
  const [synced, setSynced] = useState(false)

  if (installed) {
    return (
      <button
        type="button"
        className="block h-full w-full rounded-xl text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring md:col-span-2 lg:col-span-1"
        onClick={() => {
          installLocalDecks(true)
          setSynced(true)
        }}
      >
        <Card className="h-full">
          <CardHeader className="h-full">
            <span className="flex size-11 items-center justify-center rounded-lg bg-primary text-primary-foreground sm:size-12">
              <RefreshCw className="size-5 sm:size-6" />
            </span>
            <CardTitle className="text-xl sm:text-2xl md:text-3xl">Sync</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              {synced
                ? "The card files on this phone are up to date."
                : "Update the card files saved on this phone."}
            </CardDescription>
            <p className="text-sm font-medium text-primary">Sync cards</p>
          </CardHeader>
        </Card>
      </button>
    )
  }

  return (
    <Link
      href="/download"
      className="block h-full rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring md:col-span-2 lg:col-span-1"
    >
      <Card className="h-full">
        <CardHeader className="h-full">
          <span className="flex size-11 items-center justify-center rounded-lg bg-primary text-primary-foreground sm:size-12">
            <Download className="size-5 sm:size-6" />
          </span>
          <CardTitle className="text-xl sm:text-2xl md:text-3xl">Download</CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Install MBA and keep every card file on this device for offline play.
          </CardDescription>
          <p className="text-sm font-medium text-primary">Open</p>
        </CardHeader>
      </Card>
    </Link>
  )
}
