import type { Metadata } from "next"
import { DM_Sans, DM_Serif_Display } from "next/font/google"
import "./globals.css"
import ClientLayout from "./client-layout"

const dmSans = DM_Sans({ subsets: ["latin"], weight: ["400", "500", "600"] })
const dmSerifDisplay = DM_Serif_Display({ subsets: ["latin"], weight: "400", variable: "--font-serif" })

export const metadata: Metadata = {
  title: "Dexam2 — German B1 Prep",
  description: "Study German B1 vocabulary with mock exam exercises",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body className={dmSans.className}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}
