"use client"

import { useDictionary } from "./DictionaryProvider"

const GERMAN_REGEX = /^[A-Za-zÄÖÜäöüß-]+$/

export default function ClickableWord({ word }: { word: string }) {
  const { openDictionary } = useDictionary()
  const isGerman = GERMAN_REGEX.test(word) && word.length > 1

  if (!isGerman) {
    return <span>{word}</span>
  }

  return (
    <span
      onClick={() => openDictionary(word)}
      className="cursor-pointer hover:text-blue-600 hover:underline decoration-dotted underline-offset-2 transition-colors"
    >
      {word}
    </span>
  )
}

export function renderTextWithClicks(text: string): React.ReactNode[] {
  return text.split(/(\s+)/).map((part, i) => {
    if (part.trim() === "") {
      return <span key={i}>{part}</span>
    }
    return <ClickableWord key={i} word={part} />
  })
}
