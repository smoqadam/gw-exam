"use client"

import { useState } from "react"
import type { LeseverstehenTeil1 } from "@/types/exam"
import { renderTextWithClicks } from "../dictionary/ClickableWord"
import NotesTextarea from "./NotesTextarea"

interface Props {
  data: LeseverstehenTeil1
  examId: string
  sectionKey: string
}

export default function HeadlineMatching({ data, examId, sectionKey }: Props) {
  const [matches, setMatches] = useState<Record<number, string>>({})
  const [checked, setChecked] = useState(false)

  const handleMatch = (textId: number, headlineId: string) => {
    if (checked) return
    setMatches(prev => ({ ...prev, [textId]: headlineId }))
  }

  const check = () => setChecked(true)

  const score = checked
    ? data.texts.filter(t => matches[t.id] === data.answers[String(t.id)]).length
    : 0

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <h3 className="font-semibold text-sm text-text-secondary uppercase tracking-wider mb-3">Headlines</h3>
          <div className="space-y-1">
            {data.headlines.map(h => (
              <div key={h.id} className="px-3 py-2 rounded-lg text-sm bg-bg-main font-medium">
                <span className="text-text-secondary mr-2">{h.id})</span>
                {renderTextWithClicks(h.text)}
              </div>
            ))}
          </div>
        </div>
        <div className="lg:col-span-2">
          <h3 className="font-semibold text-sm text-text-secondary uppercase tracking-wider mb-3">Texts</h3>
          <div className="space-y-4">
            {data.texts.map(t => (
              <div key={t.id} className="border rounded-lg p-4">
                <div className="flex gap-4">
                  <span className="font-semibold text-text-secondary shrink-0">Text {t.id}</span>
                  <p className="text-sm leading-relaxed">{renderTextWithClicks(t.content)}</p>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 items-center">
                  {data.headlines.map(h => {
                    const isSelected = matches[t.id] === h.id
                    const isCorrect = checked && data.answers[String(t.id)] === h.id
                    const isWrong = checked && isSelected && !isCorrect
                    let btnClass = "px-3 py-1 rounded text-sm border transition-colors "
                    if (isSelected && !checked) btnClass += "border-accent bg-accent-subtle text-accent"
                    else if (isCorrect) btnClass += "border-success bg-success-subtle text-success"
                    else if (isWrong) btnClass += "border-error bg-error-subtle text-error"
                    else btnClass += "border-border hover:border-text-secondary text-text-secondary"
                    return (
                      <button key={h.id} onClick={() => handleMatch(t.id, h.id)} className={btnClass}>
                        {h.id}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          {!checked ? (
            <button onClick={check} className="mt-4 px-6 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover text-sm">
              Check answers
            </button>
          ) : (
            <div className="mt-4 p-4 rounded-lg bg-bg-main text-sm">
              Score: {score} / {data.texts.length}
            </div>
          )}
        </div>
      </div>

      <NotesTextarea examId={examId} sectionKey={sectionKey} />
    </div>
  )
}
