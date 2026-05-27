"use client"

import Link from "next/link"
import { useLocalStorage } from "@/hooks/useLocalStorage"
import { useExamList } from "@/hooks/useExamList"

export default function Home() {
  const [progress] = useLocalStorage<Record<string, unknown>>("exam_progress", {})
  const { exams, loading, error } = useExamList()

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: "var(--font-serif, serif)" }}>Exams</h1>
      <p className="text-text-secondary text-sm mb-6">Select an exam to start studying</p>

      {loading && <p className="text-text-secondary text-sm">Loading exams...</p>}
      {error && <p className="text-error text-sm">{error}</p>}

      <div className="space-y-4">
        {exams?.map(exam => {
          const examProgress = progress[exam.id]
          const completed = examProgress ? Object.keys(examProgress as object).length : 0
          const pct = Math.round((completed / exam.sections) * 100)

          return (
            <Link
              key={exam.id}
              href={`/exam?id=${exam.id}`}
              className="block border border-border rounded-xl p-6 hover:shadow-sm transition-all bg-surface"
            >
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-[10px] border border-border bg-bg-main flex items-center justify-center text-text-secondary shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold">{exam.label}</h2>
                  <p className="text-sm text-text-secondary">{exam.level} · {exam.totalQuestions} questions · {exam.sections} sections</p>
                  {completed > 0 && (
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-text-secondary mb-1">
                        <span>{pct}% complete</span>
                        <span>{completed}/{exam.sections} sections</span>
                      </div>
                      <div className="h-[5px] bg-border rounded-full overflow-hidden">
                        <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )}
                </div>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-border mt-2 shrink-0">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
