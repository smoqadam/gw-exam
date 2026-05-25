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
        <p className="text-sm text-text-secondary mb-3">{data.topic} · {data.play_count}x play</p>
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
                isCorrect ? "border-success bg-success-subtle" :
                isWrong ? "border-error bg-error-subtle" :
                "border-border"
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="font-semibold text-text-secondary shrink-0 text-sm">{s.id}.</span>
                <p className="flex-1 text-sm">{s.text}</p>
                <div className="flex gap-2 shrink-0">
                  {["richtig", "falsch"].map(label => {
                    const value = label === "richtig"
                    const isActive = selected === value
                    let btnClass = "px-4 py-1.5 rounded-lg text-sm font-medium border transition-colors "
                    if (checked && isActive && isCorrect) btnClass += "border-success bg-success-subtle text-success"
                    else if (checked && isActive && isWrong) btnClass += "border-error bg-error-subtle text-error"
                    else if (isActive) btnClass += "border-accent bg-accent-subtle text-accent"
                    else btnClass += "border-border text-text-secondary hover:border-text-secondary"
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
        <button onClick={check} className="px-6 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover text-sm">
          Check answers
        </button>
      ) : (
        <div className="p-4 rounded-lg bg-bg-main text-sm">
          Score: {score} / {data.statements.length}
        </div>
      )}
    </div>
  )
}
