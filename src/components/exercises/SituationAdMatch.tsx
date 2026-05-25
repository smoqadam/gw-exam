"use client"

import { useState } from "react"
import type { LeseverstehenTeil3 } from "@/types/exam"
import { renderTextWithClicks } from "../dictionary/ClickableWord"
import NotesTextarea from "./NotesTextarea"

interface Props {
  data: LeseverstehenTeil3
  examId: string
  sectionKey: string
}

export default function SituationAdMatch({ data, examId, sectionKey }: Props) {
  const [matches, setMatches] = useState<Record<number, string>>({})
  const [checked, setChecked] = useState(false)

  const select = (situationId: number, adId: string) => {
    if (checked) return
    setMatches(prev => ({ ...prev, [situationId]: adId }))
  }

  const check = () => setChecked(true)

  const score = checked
    ? data.situations.filter(s => matches[s.id] === data.answers[String(s.id)]).length
    : 0

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-500">Match each situation to the most suitable ad.</p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          {data.situations.map(s => (
            <div key={s.id} className="border rounded-lg p-4">
              <div className="flex gap-3 items-start">
                <span className="font-semibold text-gray-400 shrink-0 text-sm">{s.id}.</span>
                <p className="text-sm">{renderTextWithClicks(s.text)}</p>
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {data.ads.map(a => {
                  const isSelected = matches[s.id] === a.id
                  const isCorrect = checked && data.answers[String(s.id)] === a.id
                  const isWrong = checked && isSelected && !isCorrect
                  let btnClass = "px-2 py-0.5 rounded text-xs border transition-colors "
                  if (isSelected && !checked) btnClass += "border-blue-500 bg-blue-50 text-blue-700"
                  else if (isCorrect) btnClass += "border-green-500 bg-green-50 text-green-700"
                  else if (isWrong) btnClass += "border-red-500 bg-red-50 text-red-700"
                  else btnClass += "border-gray-200 hover:border-gray-300"
                  return (
                    <button key={a.id} onClick={() => select(s.id, a.id)} className={btnClass}>
                      {a.id}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-3">
          <h3 className="font-semibold text-sm text-gray-500 uppercase tracking-wide">Ads</h3>
          {data.ads.map(a => {
            const isAssigned = Object.values(matches).includes(a.id)
            return (
              <div key={a.id} className={`border rounded-lg p-3 text-sm transition-colors ${isAssigned ? "border-blue-300 bg-blue-50" : ""}`}>
                <div className="font-semibold text-xs text-gray-400 mb-1">{a.id}</div>
                <div className="font-medium">{renderTextWithClicks(a.title)}</div>
                <p className="text-gray-600 text-xs mt-1">{renderTextWithClicks(a.content)}</p>
              </div>
            )
          })}
        </div>
      </div>

      <NotesTextarea examId={examId} sectionKey={sectionKey} />

      {!checked ? (
        <button onClick={check} className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm">
          Check answers
        </button>
      ) : (
        <div className="p-4 rounded-lg bg-gray-50 text-sm">
          Score: {score} / {data.situations.length}
        </div>
      )}
    </div>
  )
}
