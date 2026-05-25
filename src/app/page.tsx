"use client"

import Link from "next/link"
import { useLocalStorage } from "@/hooks/useLocalStorage"

interface ExamMeta {
  id: string
  label: string
  level: string
  totalQuestions: number
  sections: number
}

const EXAMS: ExamMeta[] = [
  { id: "exam_01", label: "Exam 01 — Mock Test", level: "B1", totalQuestions: 55, sections: 9 },
]

export default function Home() {
  const [progress] = useLocalStorage<Record<string, unknown>>("exam_progress", {})

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-1">Exams</h1>
      <p className="text-gray-500 text-sm mb-6">Select an exam to start studying</p>

      <div className="space-y-4">
        {EXAMS.map(exam => {
          const examProgress = progress[exam.id]
          const completed = examProgress ? Object.keys(examProgress as object).length : 0
          const pct = Math.round((completed / exam.sections) * 100)

          return (
            <Link
              key={exam.id}
              href={`/exam/${exam.id}`}
              className="block border rounded-xl p-5 hover:border-blue-300 hover:shadow-sm transition-all bg-white"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center text-white shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold">{exam.label}</h2>
                  <p className="text-sm text-gray-500">{exam.level} · {exam.totalQuestions} questions · {exam.sections} sections</p>
                  {completed > 0 && (
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>{pct}% complete</span>
                        <span>{completed}/{exam.sections} sections</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )}
                </div>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-300 mt-2 shrink-0">
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
