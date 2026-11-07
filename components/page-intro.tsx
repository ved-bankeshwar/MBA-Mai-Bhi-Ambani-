import type { ReactNode } from "react"

export function PageIntro({
  kicker,
  title,
  children,
}: {
  kicker: string
  title: string
  children: ReactNode
}) {
  return (
    <div className="max-w-3xl">
      <p className="w-fit rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground sm:text-sm">
        {kicker}
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl">
        {title}
      </h1>
      <div className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base md:text-lg">
        {children}
      </div>
    </div>
  )
}
