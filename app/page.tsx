import Link from "next/link"
import { Download, Spade, UserRound, type LucideIcon } from "lucide-react"
import { PageIntro } from "@/components/page-intro"
import { pageShell, SiteHeader } from "@/components/site-header"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const choices: {
  href: string
  title: string
  description: string
  icon: LucideIcon
  className?: string
}[] = [
  {
    href: "/player",
    title: "Player",
    description:
      "Lock a profession and keep income, expenses, assets, and liabilities on this phone.",
    icon: UserRound,
  },
  {
    href: "/dealer",
    title: "Dealer",
    description: "Draw a profession, a deal, a market card, or a doodad.",
    icon: Spade,
  },
  {
    href: "/download",
    title: "Download",
    description:
      "Install MBA and keep every card file on this device for offline play.",
    icon: Download,
    className: "md:col-span-2 lg:col-span-1",
  },
]

export default function HomePage() {
  return (
    <div className="min-h-full">
      <SiteHeader eyebrow="Home" />
      <main className={`${pageShell} flex min-h-full flex-col justify-center`}>
      <PageIntro kicker="Mai Bhi Ambani" title="MBA">
        One phone for the dealer, one phone for each player. The cards stay on
        the table. This site shows the draw and keeps each player&apos;s sheet.
      </PageIntro>
      <div className="mt-6 grid grid-cols-1 gap-3 sm:mt-8 sm:gap-4 md:mt-10 md:grid-cols-2 lg:mt-12 lg:grid-cols-3 lg:gap-6">
        {choices.map((choice) => {
          const Icon = choice.icon
          return (
            <Link
              key={choice.href}
              href={choice.href}
              className={`block h-full rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${choice.className ?? ""}`}
            >
              <Card className="h-full">
                <CardHeader className="h-full">
                  <span className="flex size-11 items-center justify-center rounded-lg bg-primary text-primary-foreground sm:size-12">
                    <Icon className="size-5 sm:size-6" />
                  </span>
                  <CardTitle className="text-xl sm:text-2xl md:text-3xl">
                    {choice.title}
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base">
                    {choice.description}
                  </CardDescription>
                  <p className="text-sm font-medium text-primary">Open</p>
                </CardHeader>
              </Card>
            </Link>
          )
        })}
      </div>
      <p className="mt-6 max-w-3xl text-xs text-muted-foreground sm:mt-8 sm:text-sm md:text-base">
        Players are not connected to the dealer yet. Each phone keeps its own
        game until you reset it.
      </p>
      </main>
    </div>
  )
}
