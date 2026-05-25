"use client"

import { useState } from "react"
import type { SprachbausteineTeil1 } from "@/types/exam"
import { renderTextWithClicks } from "../dictionary/ClickableWord"
import NotesTextarea from "./NotesTextarea"

interface Props {
  data: SprachbausteineTeil1
  examId: string
  sectionKey: string
}

export default function GapFillChoices({ data, examId, sectionKey }: Props) {
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [submitted, setSubmitted] = useState<Record<number, boolean>>({})

  const select = (qId: number, opt: string) => {
    setAnswers(prev => ({ ...prev, [qId]: opt }))
  }

  const submit = (qId: number) => {
    setSubmitted(prev => ({ ...prev, [qId]: true }))
  }

  const allSubmitted = data.questions.every(q => submitted[q.id])
  const correctCount = allSubmitted
    ? data.questions.filter(q => answers[q.id] === q.answer).length
    : 0

  const renderGapText = () => {
    const parts = data.text_with_gaps.split(/\[(\d+)\]/)
    return parts.map((part, i) => {
      if (i % 2 === 0) {
        return <span key={i}>{renderTextWithClicks(part)}</span>
      }
      const qId = Number(part)
      const question = data.questions.find(q => q.id === qId)
      if (!question) return <span key={i}>[{qId}]</span>
      const selected = answers[qId]
      const isSubmitted = submitted[qId]
      const isCorrect = answers[qId] === question.answer
      return (
        <span key={i} className="inline-flex items-center gap-1 mx-1">
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border-2 text-sm font-medium cursor-pointer transition-colors ${
              isSubmitted && isCorrect ? "border-green-500 bg-green-50 text-green-700" :
              isSubmitted && !isCorrect ? "border-red-500 bg-red-50 text-red-700" :
              selected ? "border-blue-500 bg-blue-50 text-blue-700" :
              "border-dashed border-gray-300 text-gray-400"
            }`}
            onClick={() => submit(qId)}
          >
            {selected ? question.options[selected] : `[${qId}]`}
          </span>
          {isSubmitted && !isCorrect && (
            <span className="text-xs text-green-600 font-medium ml-1">
              → {question.options[question.answer]}
            </span>
          )}
        </span>
      )
    })
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-500 italic">{data.context}</p>

      <div className="border rounded-lg p-6 text-sm leading-loose bg-white">
        {renderGapText()}
      </div>

      <div className="space-y-4">
        {data.questions.map(q => (
          <div key={q.id} className="border rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <span className="font-semibold text-sm text-gray-400">Question {q.id}</span>
              <div className="flex gap-2">
                {Object.entries(q.options).map(([key, text]) => {
                  const isSelected = answers[q.id] === key
                  const isSubmitted = submitted[q.id]
                  const isCorrect = q.answer === key
                  let btnClass = "px-4 py-1.5 rounded-lg text-sm border transition-colors "
                  if (isSubmitted && isCorrect) btnClass += "border-green-500 bg-green-50 text-green-700"
                  else if (isSubmitted && isSelected && !isCorrect) btnClass += "border-red-500 bg-red-50 text-red-700"
                  else if (isSelected) btnClass += "border-blue-500 bg-blue-50 text-blue-700"
                  else btnClass += "border-gray-200 hover:border-gray-300"
                  return (
                    <button key={key} onClick={() => select(q.id, key)} className={btnClass}>
                      {key}) {text}
                    </button>
                  )
                })}
              </div>
            </div>

            {!submitted[q.id] ? (
              <button
                onClick={() => submit(q.id)}
                disabled={!answers[q.id]}
                className="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 disabled:opacity-50"
              >
                Submit
              </button>
            ) : (
              <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-sm">
                <p className="font-medium text-green-700">
                  {answers[q.id] === q.answer ? "✓ Correct" : "✗ Incorrect"}
                </p>
                {q.grammar_point && (
                  <p className="mt-1 text-green-600 text-xs">{q.grammar_point}</p>
                )}
              </div>
            )}

            <NotesTextarea examId={examId} sectionKey={sectionKey} questionId={q.id} />
          </div>
        ))}
      </div>

      {allSubmitted && (
        <div className="p-4 rounded-lg bg-gray-50 text-sm">
          Score: {correctCount} / {data.questions.length}
        </div>
      )}
    </div>
  )
}
