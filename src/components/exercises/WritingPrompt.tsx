"use client"

import { useState, useMemo } from "react"
import type { SchreibenSection } from "@/types/exam"
import { renderTextWithClicks } from "../dictionary/ClickableWord"
import { useLocalStorage } from "@/hooks/useLocalStorage"

interface Props {
  data: SchreibenSection
  examId: string
  sectionKey: string
}

export default function WritingPrompt({ data, examId, sectionKey }: Props) {
  const storageKey = `writing_${examId}_${sectionKey}`
  const [draft, setDraft] = useLocalStorage(storageKey, "")
  const [checkedPoints, setCheckedPoints] = useLocalStorage<string[]>(`writing_checks_${examId}_${sectionKey}`, [])

  const wordCount = useMemo(() => draft.trim() ? draft.trim().split(/\s+/).length : 0, [draft])

  const togglePoint = (point: string) => {
    setCheckedPoints(prev =>
      prev.includes(point) ? prev.filter(p => p !== point) : [...prev, point]
    )
  }

  return (
    <div className="space-y-6">
      <div className="border border-border rounded-lg p-4 bg-bg-main">
        <div className="flex items-center gap-2 mb-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-secondary">
            <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/>
          </svg>
          <span className="font-semibold text-sm">Incoming letter from {data.incoming_letter.sender}</span>
        </div>
        <p className="text-sm leading-relaxed whitespace-pre-line">{renderTextWithClicks(data.incoming_letter.content)}</p>
      </div>

      <div>
        <h3 className="font-semibold text-sm text-text-secondary uppercase tracking-wider mb-2">Required points</h3>
        <div className="flex flex-wrap gap-2">
          {data.required_points.map(point => (
            <button
              key={point}
              onClick={() => togglePoint(point)}
              className={`px-3 py-1.5 rounded-lg text-sm border transition-colors flex items-center gap-2 ${
                  checkedPoints.includes(point)
                    ? "border-success bg-success-subtle text-success"
                    : "border-border text-text-secondary hover:border-text-secondary"
              }`}
            >
              {checkedPoints.includes(point) && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              )}
              {point}
            </button>
          ))}
        </div>
      </div>

      <div>
        <textarea
          className="w-full border border-border rounded-lg p-4 text-sm resize-y leading-relaxed focus:outline-none focus:ring-2 focus:ring-accent min-h-[300px]"
          placeholder="Write your letter here..."
          value={draft}
          onChange={e => setDraft(e.target.value)}
        />
        <div className="flex justify-between items-center mt-2 text-sm">
          <span className={wordCount >= data.min_words ? "text-green-600" : "text-text-secondary"}>
            {wordCount} words {wordCount < data.min_words ? `(min ${data.min_words})` : "✓ minimum met"}
          </span>
          <button
            onClick={() => setDraft("")}
            className="text-text-secondary hover:text-text-primary text-xs"
          >
            Clear draft
          </button>
        </div>
      </div>
    </div>
  )
}
