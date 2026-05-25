"use client"

import { useState, useMemo } from "react"
import { useLocalStorage } from "@/hooks/useLocalStorage"
import type { DictionaryEntry } from "@/lib/dictionary"

export default function VocabPage() {
  const [savedWords, setSavedWords] = useLocalStorage<string[]>("saved_vocab", [])
  const [wordEntries, setWordEntries] = useLocalStorage<Record<string, DictionaryEntry>>("vocab_entries", {})
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<string>("All")
  const [flashcard, setFlashcard] = useState(false)
  const [cardIndex, setCardIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)

  const entries = useMemo(() => {
    return savedWords
      .map(w => wordEntries[w])
      .filter((e): e is DictionaryEntry => !!e)
  }, [savedWords, wordEntries])

  const filtered = useMemo(() => {
    return entries.filter(e => {
      if (search && !e.word.toLowerCase().includes(search.toLowerCase()) &&
          !e.english_translations.some(t => t.toLowerCase().includes(search.toLowerCase()))) return false
      if (filter !== "All" && e.part_of_speech !== filter.toLowerCase()) return false
      return true
    })
  }, [entries, search, filter])

  const removeWord = (word: string) => {
    setSavedWords(prev => prev.filter(w => w !== word))
    setWordEntries(prev => {
      const next = { ...prev }
      delete next[word]
      return next
    })
  }

  const parts = ["All", "Noun", "Verb", "Adjective"]

  if (flashcard && filtered.length > 0) {
    const current = filtered[cardIndex % filtered.length]
    return (
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold" style={{ fontFamily: "var(--font-serif, serif)" }}>Flashcard Drill</h1>
          <button onClick={() => { setFlashcard(false); setRevealed(false) }} className="text-sm text-text-secondary hover:text-gray-700">
            Back to list
          </button>
        </div>
        <div
          onClick={() => setRevealed(true)}
          className="border-2 border-border rounded-2xl p-12 text-center cursor-pointer hover:border-accent transition-colors bg-surface min-h-[300px] flex flex-col items-center justify-center"
        >
          <div className="text-3xl font-bold mb-4">{current.word}</div>
          {current.ipa && <div className="text-sm text-text-secondary mb-2">{current.ipa}</div>}
          {current.article && <div className="text-sm text-text-secondary mb-2">{current.article}</div>}
          <div className="text-xs text-text-secondary uppercase tracking-wide mb-4">{current.part_of_speech}</div>
          {revealed && (
            <div className="space-y-3 mt-4 pt-4 border-t w-full">
              <div className="text-xl">{current.english_translations.join(" · ")}</div>
              {current.german_definition && <div className="text-sm text-gray-600">{current.german_definition}</div>}
              {current.examples.length > 0 && (
                <div className="text-sm text-left">
                  <p className="text-gray-800">{current.examples[0].de}</p>
                  <p className="text-text-secondary text-xs">{current.examples[0].en}</p>
                </div>
              )}
            </div>
          )}
          {!revealed && <p className="text-sm text-text-secondary mt-4">Click to reveal</p>}
        </div>
        <div className="flex justify-between mt-6">
          <button
            onClick={() => { setCardIndex(i => Math.max(0, i - 1)); setRevealed(false) }}
            disabled={cardIndex === 0}
            className="px-4 py-2 border border-border rounded-lg text-sm text-text-primary disabled:opacity-30"
          >
            ← Previous
          </button>
          <span className="text-sm text-text-secondary self-center">{cardIndex + 1} / {filtered.length}</span>
          <button
            onClick={() => { setCardIndex(i => Math.min(filtered.length - 1, i + 1)); setRevealed(false) }}
            disabled={cardIndex >= filtered.length - 1}
            className="px-4 py-2 border border-border rounded-lg text-sm text-text-primary disabled:opacity-30"
          >
            Next →
          </button>
        </div>
        <p className="text-center text-xs text-text-secondary mt-4">Click card to reveal translation</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-serif, serif)" }}>My Vocab</h1>
          <p className="text-sm text-text-secondary">{entries.length} words saved</p>
        </div>
        {entries.length > 0 && (
          <button onClick={() => setFlashcard(true)} className="px-4 py-2 bg-accent text-white rounded-lg text-sm hover:bg-accent-hover">
            Flashcard drill
          </button>
        )}
      </div>

      <div className="relative mb-4">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          className="w-full pl-9 pr-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent bg-surface"
          placeholder="Search words..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        {parts.map(p => (
          <button
            key={p}
            onClick={() => setFilter(p)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              filter === p ? "bg-accent text-white" : "bg-bg-main text-text-secondary hover:bg-border"
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-text-secondary text-sm">
          {entries.length === 0 ? "No saved words yet. Click any German word in an exercise to save it." : "No words match your search."}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(e => (
            <div key={e.word} className="flex items-center gap-3 p-3 rounded-xl border border-border bg-surface">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{e.word}</span>
                  <span className="text-xs text-text-secondary">{e.part_of_speech}</span>
                </div>
                <div className="text-sm text-gray-600 truncate">{e.english_translations.join(", ")}</div>
              </div>
              <button onClick={() => removeWord(e.word)} className="text-border hover:text-error transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6"/><path d="M16 6l-.286-1.717A1.118 1.118 0 0 0 14.638 3H9.362a1.118 1.118 0 0 0-1.076.783L8 6"/>
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
