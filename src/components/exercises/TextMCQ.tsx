"use client"

import { useState } from "react"
import type { LeseverstehenTeil2 } from "@/types/exam"
import { renderTextWithClicks } from "../dictionary/ClickableWord"
import NotesTextarea from "./NotesTextarea"

interface Props {
  data: LeseverstehenTeil2
  examId: string
  sectionKey: string
}

export default function TextMCQ({ data, examId, sectionKey }: Props) {
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [checked, setChecked] = useState(false)

  const select = (qId: number, opt: string) => {
    if (checked) return
    setAnswers(prev => ({ ...prev, [qId]: opt }))
  }

  const check = () => setChecked(true)

  const score = checked
    ? data.questions.filter(q => answers[q.id] === q.answer).length
    : 0

  return (
    <div className="space-y-6">
      <details className="border rounded-lg" open>
        <summary className="font-semibold p-4 cursor-pointer hover:bg-gray-50">{data.title}</summary>
        <div className="px-4 pb-4 text-sm leading-relaxed max-h-80 overflow-y-auto">
          {renderTextWithClicks(data.content)}
        </div>
      </details>

      <div className="space-y-6">
        {data.questions.map(q => (
          <div key={q.id} className="border rounded-lg p-4">
            <p className="font-medium text-sm mb-3">{renderTextWithClicks(q.stem)}</p>
            <div className="space-y-2">
              {Object.entries(q.options).map(([key, text]) => {
                const isSelected = answers[q.id] === key
                const isCorrect = checked && q.answer === key
                const isWrong = checked && isSelected && !isCorrect
                let optClass = "flex items-center gap-3 p-3 rounded-lg border text-sm cursor-pointer transition-colors "
                if (isSelected && !checked) optClass += "border-blue-500 bg-blue-50"
                else if (isCorrect) optClass += "border-green-500 bg-green-50"
                else if (isWrong) optClass += "border-red-500 bg-red-50"
                else optClass += "border-gray-200 hover:border-gray-300"
                return (
                  <div key={key} onClick={() => select(q.id, key)} className={optClass}>
                    <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-xs font-medium shrink-0">
                      {key}
                    </span>
                    <span>{renderTextWithClicks(text)}</span>
                  </div>
                )
              })}
            </div>
            <NotesTextarea examId={examId} sectionKey={sectionKey} questionId={q.id} />
          </div>
        ))}
      </div>

      {!checked ? (
        <button onClick={check} className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm">
          Check answers
        </button>
      ) : (
        <div className="p-4 rounded-lg bg-gray-50 text-sm">
          Score: {score} / {data.questions.length}
        </div>
      )}
    </div>
  )
}
