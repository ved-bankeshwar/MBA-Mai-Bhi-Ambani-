import type { ReactNode } from "react";
import Link from "next/link";

const shell =
  "mx-auto flex w-full max-w-lg items-center justify-between gap-3 px-4 py-3 sm:max-w-2xl sm:px-6 sm:py-4 md:max-w-3xl md:px-8 lg:max-w-5xl lg:px-10 xl:max-w-6xl xl:px-12 2xl:max-w-7xl 2xl:px-16";

export function SiteHeader({
  eyebrow,
  action,
}: {
  eyebrow: string
  action?: ReactNode
}) {
  return (
    <header className="border-b bg-background">
      <div className={shell}>
        <div className="min-w-0">
          <Link href="/" className="text-lg font-semibold sm:text-xl md:text-2xl">
            MBA
          </Link>
          <p className="text-xs text-muted-foreground sm:text-sm">{eyebrow}</p>
        </div>
        {action}
      </div>
    </header>
  );
}

export const pageShell =
  "mx-auto w-full max-w-lg px-4 py-4 sm:max-w-2xl sm:px-6 sm:py-6 md:max-w-3xl md:px-8 md:py-8 lg:max-w-5xl lg:px-10 lg:py-10 xl:max-w-6xl xl:px-12 xl:py-12 2xl:max-w-7xl 2xl:px-16 2xl:py-14";
