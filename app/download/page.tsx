import type { Metadata } from "next"
import { DownloadPanel } from "@/components/download-panel"

export const metadata: Metadata = {
  title: "Download",
}

export default function DownloadPage() {
  return <DownloadPanel />
}
