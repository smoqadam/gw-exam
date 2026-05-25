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
          <h3 className="font-semibold text-sm text-gray-500 uppercase tracking-wide mb-3">Headlines</h3>
          <div className="space-y-1">
            {data.headlines.map(h => (
              <div key={h.id} className="px-3 py-2 rounded-lg text-sm bg-gray-50 font-medium">
                <span className="text-gray-400 mr-2">{h.id})</span>
                {renderTextWithClicks(h.text)}
              </div>
            ))}
          </div>
        </div>
        <div className="lg:col-span-2">
          <h3 className="font-semibold text-sm text-gray-500 uppercase tracking-wide mb-3">Texts</h3>
          <div className="space-y-4">
            {data.texts.map(t => (
              <div key={t.id} className="border rounded-lg p-4">
                <div className="flex gap-4">
                  <span className="font-semibold text-gray-400 shrink-0">Text {t.id}</span>
                  <p className="text-sm leading-relaxed">{renderTextWithClicks(t.content)}</p>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 items-center">
                  {data.headlines.map(h => {
                    const isSelected = matches[t.id] === h.id
                    const isCorrect = checked && data.answers[String(t.id)] === h.id
                    const isWrong = checked && isSelected && !isCorrect
                    let btnClass = "px-3 py-1 rounded text-sm border transition-colors "
                    if (isSelected && !checked) btnClass += "border-blue-500 bg-blue-50 text-blue-700"
                    else if (isCorrect) btnClass += "border-green-500 bg-green-50 text-green-700"
                    else if (isWrong) btnClass += "border-red-500 bg-red-50 text-red-700"
                    else btnClass += "border-gray-200 hover:border-gray-300 text-gray-600"
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
            <button onClick={check} className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm">
              Check answers
            </button>
          ) : (
            <div className="mt-4 p-4 rounded-lg bg-gray-50 text-sm">
              Score: {score} / {data.texts.length}
            </div>
          )}
        </div>
      </div>

      <NotesTextarea examId={examId} sectionKey={sectionKey} />
    </div>
  )
}
