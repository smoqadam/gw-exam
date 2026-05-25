"use client"

import { useLocalStorage } from "./useLocalStorage"

interface QuestionResult {
  questionId: number
  correct: boolean
  selected: string
}

interface SectionProgress {
  results: QuestionResult[]
}

interface ExamProgress {
  [sectionKey: string]: SectionProgress
}

export function useProgress(examId: string) {
  const [progress, setProgress] = useLocalStorage<Record<string, ExamProgress>>("exam_progress", {})

  const getSectionProgress = (sectionKey: string): SectionProgress => {
    return progress[examId]?.[sectionKey] ?? { results: [] }
  }

  const recordAnswer = (sectionKey: string, questionId: number, correct: boolean, selected: string) => {
    setProgress(prev => {
      const exam = { ...(prev[examId] || {}) }
      const section = { ...(exam[sectionKey] || { results: [] }) }
      const existing = section.results.findIndex(r => r.questionId === questionId)
      const result: QuestionResult = { questionId, correct, selected }
      const results = existing >= 0
        ? section.results.map((r, i) => i === existing ? result : r)
        : [...section.results, result]
      return {
        ...prev,
        [examId]: { ...exam, [sectionKey]: { ...section, results } },
      }
    })
  }

  const getSectionScore = (sectionKey: string): { correct: number; total: number } => {
    const section = getSectionProgress(sectionKey)
    return {
      correct: section.results.filter(r => r.correct).length,
      total: section.results.length,
    }
  }

  return { getSectionProgress, recordAnswer, getSectionScore }
}
