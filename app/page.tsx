import Link from "next/link";
import { pageShell } from "@/components/site-header";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function HomePage() {
  return (
    <main className={`${pageShell} flex min-h-full flex-col justify-center`}>
      <p className="text-xs font-medium text-muted-foreground sm:text-sm">
        Cashflow game
      </p>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl">
        MBA
      </h1>
      <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:mt-4 sm:text-base md:text-lg lg:max-w-3xl">
        One phone for the dealer, one phone for each player. The cards stay on
        the table. This site only shows the draw and keeps each player&apos;s
        sheet.
      </p>
      <div className="mt-6 grid grid-cols-1 gap-3 sm:mt-8 sm:gap-4 md:mt-10 md:grid-cols-2 lg:gap-6 xl:mt-12">
        <Link href="/player" className="block h-full">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl md:text-3xl">
                Player
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Lock your profession and track income, expenses, assets, and
                liabilities.
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/dealer" className="block h-full">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl md:text-3xl">
                Dealer
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Draw a profession, a deal, a market card, or a doodad.
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/download" className="block h-full md:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl md:text-3xl">
                Download
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Install MBA on this phone and keep the card files for offline
                play.
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>
      <p className="mt-6 text-xs text-muted-foreground sm:mt-8 sm:text-sm md:text-base">
        Players are not connected to the dealer yet. Each phone keeps its own
        game until you reset it.
      </p>
    </main>
  );
}
