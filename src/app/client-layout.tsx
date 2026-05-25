"use client"

import Sidebar from "@/components/layout/Sidebar"
import { DictionaryProvider } from "@/components/dictionary/DictionaryProvider"

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <DictionaryProvider>
      <div className="flex h-screen">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          {children}
        </main>
      </div>
    </DictionaryProvider>
  )
}
