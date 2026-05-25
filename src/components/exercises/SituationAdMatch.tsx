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
      <p className="text-sm text-text-secondary">Match each situation to the most suitable ad.</p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          {data.situations.map(s => (
            <div key={s.id} className="border rounded-lg p-4">
              <div className="flex gap-3 items-start">
                <span className="font-semibold text-text-secondary shrink-0 text-sm">{s.id}.</span>
                <p className="text-sm">{renderTextWithClicks(s.text)}</p>
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {data.ads.map(a => {
                  const isSelected = matches[s.id] === a.id
                  const isCorrect = checked && data.answers[String(s.id)] === a.id
                  const isWrong = checked && isSelected && !isCorrect
                  let btnClass = "px-2 py-0.5 rounded text-xs border transition-colors "
                  if (isSelected && !checked) btnClass += "border-accent bg-accent-subtle text-accent"
                  else if (isCorrect) btnClass += "border-success bg-success-subtle text-success"
                  else if (isWrong) btnClass += "border-error bg-error-subtle text-error"
                  else btnClass += "border-border hover:border-text-secondary"
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
          <h3 className="font-semibold text-sm text-text-secondary uppercase tracking-wider">Ads</h3>
          {data.ads.map(a => {
            const isAssigned = Object.values(matches).includes(a.id)
            return (
              <div key={a.id} className={`border rounded-lg p-3 text-sm transition-colors ${isAssigned ? "border-accent bg-accent-subtle" : ""}`}>
                <div className="font-semibold text-xs text-text-secondary mb-1">{a.id}</div>
                <div className="font-medium">{renderTextWithClicks(a.title)}</div>
                <p className="text-gray-600 text-xs mt-1">{renderTextWithClicks(a.content)}</p>
              </div>
            )
          })}
        </div>
      </div>

      <NotesTextarea examId={examId} sectionKey={sectionKey} />

      {!checked ? (
        <button onClick={check} className="px-6 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover text-sm">
          Check answers
        </button>
      ) : (
        <div className="p-4 rounded-lg bg-bg-main text-sm">
          Score: {score} / {data.situations.length}
        </div>
      )}
    </div>
  )
}
