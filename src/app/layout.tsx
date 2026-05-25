import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import ClientLayout from "./client-layout"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Dexam2 — German B1 Prep",
  description: "Study German B1 vocabulary with mock exam exercises",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body className={`${inter.className} bg-gray-50`}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}
