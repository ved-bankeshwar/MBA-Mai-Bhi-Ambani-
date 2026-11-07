"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { buttonVariants } from "@/components/ui/button"

const links = [
  { href: "/player", label: "Player" },
  { href: "/dealer", label: "Dealer" },
  { href: "/download", label: "Download" },
]

export function SiteNav() {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Game"
      className="grid w-full grid-cols-3 gap-1 sm:flex sm:w-auto sm:justify-end"
    >
      {links.map((link) => {
        const active = pathname === link.href
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={buttonVariants({
              variant: active ? "secondary" : "ghost",
              size: "sm",
              className: "h-11 px-2 sm:h-8 sm:px-3",
            })}
          >
            {link.label}
          </Link>
        )
      })}
    </nav>
  )
}
