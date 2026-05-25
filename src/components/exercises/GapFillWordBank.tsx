"use client"

import { useState, useMemo } from "react"
import type { SprachbausteineTeil2 } from "@/types/exam"
import { renderTextWithClicks } from "../dictionary/ClickableWord"
import NotesTextarea from "./NotesTextarea"

interface Props {
  data: SprachbausteineTeil2
  examId: string
  sectionKey: string
}

const WORD_BANK_LABELS: Record<string, string> = {
  a: "AM", b: "AUFTRAG", c: "FRAGEN", d: "GEEIGNET",
  e: "GEGEUBER", f: "INFORMATIONEN", g: "KÖNNTEN", h: "NENNEN",
  i: "NUN", j: "STATTFINDEN", k: "TERMIN", l: "TROTZDEM",
  m: "VOR", n: "WÄREN", o: "WEGEN",
}

const GAP_IDS = [31, 32, 33, 34, 35, 36, 37, 38, 39, 40]

export default function GapFillWordBank({ data, examId, sectionKey }: Props) {
  const [assignments, setAssignments] = useState<Record<number, string>>({})
  const [usedWords, setUsedWords] = useState<Set<string>>(new Set())
  const [checked, setChecked] = useState(false)

  const wordBankEntries = useMemo(() => Object.entries(data.word_bank), [data.word_bank])

  const assign = (gapId: number, wordKey: string) => {
    if (checked) return
    setAssignments(prev => {
      const oldKey = prev[gapId]
      const newUsed = new Set(usedWords)
      if (oldKey) newUsed.delete(oldKey)
      newUsed.add(wordKey)
      setUsedWords(newUsed)
      return { ...prev, [gapId]: wordKey }
    })
  }

  const getGapsFromText = () => {
    const parts = data.text_with_gaps.split(/\[(\d+)\]/)
    return parts.map((part, i) => {
      if (i % 2 === 0) return <span key={i}>{renderTextWithClicks(part)}</span>
      const gapId = Number(part)
      const assigned = assignments[gapId]
      const correct = data.answers[String(gapId)]
      const isCorrect = checked && assigned === correct
      const isWrong = checked && assigned && assigned !== correct
      return (
        <span key={i} className={`inline-flex items-center mx-1 px-2 py-0.5 rounded border-2 text-sm font-medium ${
          isCorrect ? "border-green-500 bg-green-50 text-green-700" :
          isWrong ? "border-red-500 bg-red-50 text-red-700" :
          assigned ? "border-blue-500 bg-blue-50 text-blue-700" :
          "border-dashed border-gray-300 text-gray-400"
        }`}>
          {assigned ? WORD_BANK_LABELS[assigned] ?? assigned : `[${gapId}]`}
        </span>
      )
    })
  }

  const check = () => setChecked(true)
  const score = checked ? GAP_IDS.filter(id => assignments[id] === data.answers[String(id)]).length : 0

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-500 italic">{data.context}</p>

      <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-lg">
        {wordBankEntries.map(([key, word]) => {
          const isUsed = usedWords.has(key)
          return (
            <button
              key={key}
              onClick={() => {
                if (!checked && isUsed) {
                  setUsedWords(prev => { const n = new Set(prev); n.delete(key); return n })
                  setAssignments(prev => {
                    const n = { ...prev }
                    for (const [g, w] of Object.entries(n)) { if (w === key) { delete n[Number(g)]; break } }
                    return n
                  })
                }
              }}
              className={`px-3 py-1 rounded text-sm font-mono transition-colors ${
                isUsed ? "bg-blue-100 text-blue-700 border border-blue-300" : "bg-white border border-gray-200 hover:border-gray-300"
              }`}
            >
              {word}
            </button>
          )
        })}
      </div>

      <div className="border rounded-lg p-6 text-sm leading-loose bg-white">
        {getGapsFromText()}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {GAP_IDS.map(gapId => (
          <div key={gapId} className="border rounded-lg p-3 text-center">
            <div className="text-xs text-gray-400 mb-1">#{gapId}</div>
            <select
              className="w-full text-sm border rounded p-1"
              value={assignments[gapId] || ""}
              onChange={e => assign(gapId, e.target.value)}
              disabled={checked}
            >
              <option value="">---</option>
              {wordBankEntries.map(([key, word]) => (
                <option key={key} value={key} disabled={usedWords.has(key) && assignments[gapId] !== key}>
                  {word}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      <NotesTextarea examId={examId} sectionKey={sectionKey} />

      {!checked ? (
        <button onClick={check} className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm">
          Check answers
        </button>
      ) : (
        <div className="p-4 rounded-lg bg-gray-50 text-sm">
          Score: {score} / {GAP_IDS.length}
        </div>
      )}
    </div>
  )
}
