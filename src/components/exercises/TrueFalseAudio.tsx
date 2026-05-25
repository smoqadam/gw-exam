"use client"

import { useState } from "react"
import type { HoerverstehenTeil } from "@/types/exam"
import AudioPlayer from "../ui/AudioPlayer"
import NotesTextarea from "./NotesTextarea"

interface Props {
  data: HoerverstehenTeil
  examId: string
  sectionKey: string
  audioSrc: string
}

export default function TrueFalseAudio({ data, examId, sectionKey, audioSrc }: Props) {
  const [answers, setAnswers] = useState<Record<number, boolean>>({})
  const [checked, setChecked] = useState(false)

  const select = (qId: number, value: boolean) => {
    if (checked) return
    setAnswers(prev => ({ ...prev, [qId]: value }))
  }

  const check = () => setChecked(true)

  const score = checked
    ? data.statements.filter(s => answers[s.id] === s.answer).length
    : 0

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-gray-500 mb-3">{data.topic} · {data.play_count}x play</p>
        <AudioPlayer src={audioSrc} />
      </div>

      <div className="space-y-3">
        {data.statements.map(s => {
          const selected = answers[s.id]
          const isCorrect = checked && selected === s.answer
          const isWrong = checked && selected !== undefined && selected !== s.answer
          return (
            <div
              key={s.id}
              className={`border rounded-lg p-4 transition-colors ${
                isCorrect ? "border-green-300 bg-green-50" :
                isWrong ? "border-red-300 bg-red-50" :
                "border-gray-200"
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="font-semibold text-gray-400 shrink-0 text-sm">{s.id}.</span>
                <p className="flex-1 text-sm">{s.text}</p>
                <div className="flex gap-2 shrink-0">
                  {["richtig", "falsch"].map(label => {
                    const value = label === "richtig"
                    const isActive = selected === value
                    let btnClass = "px-4 py-1.5 rounded-lg text-sm font-medium border transition-colors "
                    if (checked && isActive && isCorrect) btnClass += "border-green-500 bg-green-100 text-green-700"
                    else if (checked && isActive && isWrong) btnClass += "border-red-500 bg-red-100 text-red-700"
                    else if (isActive) btnClass += "border-blue-500 bg-blue-50 text-blue-700"
                    else btnClass += "border-gray-200 text-gray-500 hover:border-gray-300"
                    return (
                      <button key={label} onClick={() => select(s.id, value)} className={btnClass}>
                        {label.charAt(0).toUpperCase() + label.slice(1)}
                      </button>
                    )
                  })}
                </div>
              </div>
              <NotesTextarea examId={examId} sectionKey={sectionKey} questionId={s.id} />
            </div>
          )
        })}
      </div>

      {!checked ? (
        <button onClick={check} className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm">
          Check answers
        </button>
      ) : (
        <div className="p-4 rounded-lg bg-gray-50 text-sm">
          Score: {score} / {data.statements.length}
        </div>
      )}
    </div>
  )
}
