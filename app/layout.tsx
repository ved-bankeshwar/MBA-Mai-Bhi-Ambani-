import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: {
    default: "MBA",
    template: "%s · MBA",
  },
  description:
    "MBA is a tabletop cashflow game. The dealer draws cards. Each player keeps their own sheet.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("h-full font-sans", geist.variable)}>
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}
