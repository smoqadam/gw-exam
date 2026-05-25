"use client"

import { useDictionary } from "./DictionaryProvider"

const GERMAN_REGEX = /^[A-Za-zÄÖÜäöüß-]+$/

export default function ClickableWord({ word }: { word: string }) {
  const { openDictionary } = useDictionary()
  const stripped = word.replace(/^[.,!?;:()"'«»]+|[.,!?;:()"'«»]+$/g, "")
  const isGerman = GERMAN_REGEX.test(stripped) && stripped.length > 1

  if (!isGerman) {
    return <span>{word}</span>
  }

  return (
    <span
      onClick={() => openDictionary(stripped)}
      className="cursor-pointer hover:text-accent hover:underline decoration-dotted underline-offset-2 transition-colors"
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
