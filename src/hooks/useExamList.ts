"use client"

import { useState, useEffect } from "react"
import { manifestUrl } from "@/lib/config"

export interface ExamMeta {
  id: string
  label: string
  level: string
  totalQuestions: number
  sections: number
}

let LIST_CACHE: ExamMeta[] | null = null

export function useExamList() {
  const [exams, setExams] = useState<ExamMeta[] | null>(LIST_CACHE)
  const [loading, setLoading] = useState(!LIST_CACHE)
  const [error, setError] = useState("")

  useEffect(() => {
    if (LIST_CACHE) return

    fetch(manifestUrl())
      .then(res => {
        if (!res.ok) throw new Error("Could not load exam list")
        return res.json()
      })
      .then(json => {
        LIST_CACHE = json.exams
        setExams(json.exams)
        setLoading(false)
      })
      .catch(e => {
        setError(e.message)
        setLoading(false)
      })
  }, [])

  return { exams, loading, error }
}
