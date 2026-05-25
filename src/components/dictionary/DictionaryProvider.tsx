"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import { type DictionaryEntry } from "@/lib/dictionary"
import DictionaryDrawer from "./DictionaryDrawer"

interface DictContextValue {
  lookupWord: string
  openDictionary: (word: string) => void
  closeDictionary: () => void
}

const DictContext = createContext<DictContextValue>({
  lookupWord: "",
  openDictionary: () => {},
  closeDictionary: () => {},
})

export function useDictionary() {
  return useContext(DictContext)
}

export function DictionaryProvider({ children }: { children: ReactNode }) {
  const [lookupWord, setLookupWord] = useState("")
  const [isOpen, setIsOpen] = useState(false)

  const openDictionary = useCallback((word: string) => {
    setLookupWord(word)
    setIsOpen(true)
  }, [])

  const closeDictionary = useCallback(() => {
    setIsOpen(false)
  }, [])

  return (
    <DictContext.Provider value={{ lookupWord, openDictionary, closeDictionary }}>
      {children}
      <DictionaryDrawer isOpen={isOpen} onClose={closeDictionary} initialWord={lookupWord} />
    </DictContext.Provider>
  )
}
