"use client"

import { useState, useEffect, useCallback } from "react"
import { lookupWord, type DictionaryEntry } from "@/lib/dictionary"

interface Props {
  isOpen: boolean
  onClose: () => void
  initialWord: string
}

export default function DictionaryDrawer({ isOpen, onClose, initialWord }: Props) {
  const [query, setQuery] = useState(initialWord)
  const [entry, setEntry] = useState<DictionaryEntry | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    setQuery(initialWord)
    if (initialWord) {
      setLoading(true)
      setError("")
      lookupWord(initialWord)
        .then(res => setEntry(res.entry))
        .catch(e => setError(e.message))
        .finally(() => setLoading(false))
    }
  }, [initialWord])

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return
    setLoading(true)
    setError("")
    try {
      const res = await lookupWord(query.trim())
      setEntry(res.entry)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }, [query])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/30" onClick={onClose} />
      <div className="w-80 bg-white shadow-xl flex flex-col border-l overflow-y-auto">
        <div className="flex items-center justify-between p-3 border-b">
          <h2 className="font-semibold text-sm">Dictionary</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="p-3 border-b">
          <div className="relative">
            <svg className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              className="w-full pl-8 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Type a German word..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
            />
          </div>
        </div>

        <div className="flex-1 p-3">
          {loading && <p className="text-sm text-gray-500">Looking up...</p>}
          {error && <p className="text-sm text-red-500">{error}</p>}
          {entry && !loading && (
            <div className="space-y-3">
              <div>
                <div className="text-lg font-bold">{entry.word}</div>
                <div className="text-sm text-gray-500">
                  {entry.ipa && `${entry.ipa} · `}{entry.part_of_speech}
                  {entry.article && ` · ${entry.article}`}
                </div>
                {entry.lemma && (
                  <div className="text-xs text-gray-400 mt-1">
                    Lemma: <em>{entry.lemma}</em>
                  </div>
                )}
              </div>

              <div>
                <div className="text-sm font-medium text-gray-700">English</div>
                <div className="text-sm">{entry.english_translations.join(", ")}</div>
              </div>

              {entry.german_definition && (
                <div>
                  <div className="text-sm font-medium text-gray-700">Definition</div>
                  <div className="text-sm">{entry.german_definition}</div>
                </div>
              )}

              {entry.grammar_notes && (
                <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                  {entry.grammar_notes}
                </div>
              )}

              {entry.conjugation && (
                <div>
                  <div className="text-sm font-medium text-gray-700">Conjugation</div>
                  <div className="text-xs text-gray-600">{entry.conjugation}</div>
                </div>
              )}

              {entry.plural && (
                <div>
                  <div className="text-sm font-medium text-gray-700">Plural</div>
                  <div className="text-xs text-gray-600">{entry.plural}</div>
                </div>
              )}

              {entry.examples.length > 0 && (
                <div>
                  <div className="text-sm font-medium text-gray-700">Examples</div>
                  {entry.examples.map((ex, i) => (
                    <div key={i} className="mt-1 text-sm">
                      <p className="text-gray-800">{ex.de}</p>
                      <p className="text-gray-500 text-xs">{ex.en}</p>
                    </div>
                  ))}
                </div>
              )}

              {entry.related_words.length > 0 && (
                <div>
                  <div className="text-sm font-medium text-gray-700">Related</div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {entry.related_words.map(w => (
                      <span key={w} className="px-2 py-0.5 bg-gray-100 rounded text-xs">{w}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
