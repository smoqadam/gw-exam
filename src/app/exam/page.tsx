"use client"

import { Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useExamData } from "@/hooks/useExamData"
import { useProgress } from "@/hooks/useProgress"
import { SECTION_CONFIG } from "@/lib/exam"

function ExamView() {
  const examId = useSearchParams().get("id") ?? ""
  const { data, loading, error } = useExamData(examId)
  const { getSectionScore } = useProgress(examId)

  if (!examId) return <p className="text-error text-sm">No exam selected.</p>
  if (loading) return <p className="text-text-secondary text-sm">Loading exam...</p>
  if (error) return <p className="text-error text-sm">{error}</p>
  if (!data) return null

  const grouped = SECTION_CONFIG.reduce<Record<string, typeof SECTION_CONFIG>>((acc, s) => {
    if (!acc[s.groupLabel]) acc[s.groupLabel] = []
    acc[s.groupLabel].push(s)
    return acc
  }, {})

  return (
    <div className="max-w-2xl">
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary mb-4">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        Back to exams
      </Link>

      <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: "var(--font-serif, serif)" }}>{data.exam_id.replace("_", " ").toUpperCase()}</h1>
      <p className="text-sm text-text-secondary mb-6">Level: {data.level} · Source: {data.source}</p>

      {Object.entries(grouped).map(([group, sections]) => (
        <div key={group} className="mb-8">
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">{group}</h2>
          <div className="space-y-2">
            {sections.map(s => {
              const score = getSectionScore(s.key)
              return (
                <Link
                  key={s.key}
                  href={`/exam/section?id=${examId}&section=${s.key}`}
                  className="flex items-center gap-3 p-4 rounded-xl border border-border bg-surface hover:shadow-sm transition-all"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{s.label}</div>
                    <div className="text-xs text-text-secondary">{s.totalQuestions} questions</div>
                  </div>
                  {score.total > 0 && (
                    <div className="text-sm font-medium text-accent">
                      {score.correct}/{score.total}
                    </div>
                  )}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-border shrink-0">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </Link>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function ExamPage() {
  return (
    <Suspense fallback={<p className="text-text-secondary text-sm">Loading exam...</p>}>
      <ExamView />
    </Suspense>
  )
}
