"use client"

import Sidebar from "@/components/layout/Sidebar"
import { DictionaryProvider } from "@/components/dictionary/DictionaryProvider"

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <DictionaryProvider>
      <div className="flex h-screen bg-bg-main">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-8 lg:p-10">
          {children}
        </main>
      </div>
    </DictionaryProvider>
  )
}
