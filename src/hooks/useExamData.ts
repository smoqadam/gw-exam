"use client"

import { useState, useEffect } from "react"
import type { ExamData } from "@/types/exam"

const EXAM_CACHE = new Map<string, ExamData>()

export function useExamData(examId: string) {
  const [data, setData] = useState<ExamData | null>(EXAM_CACHE.get(examId) ?? null)
  const [loading, setLoading] = useState(!data)
  const [error, setError] = useState("")

  useEffect(() => {
    if (EXAM_CACHE.has(examId)) {
      setData(EXAM_CACHE.get(examId)!)
      setLoading(false)
      return
    }

    fetch(`/data/${examId}.json`)
      .then(res => {
        if (!res.ok) throw new Error("Exam not found")
        return res.json()
      })
      .then(json => {
        EXAM_CACHE.set(examId, json)
        setData(json)
        setLoading(false)
      })
      .catch(e => {
        setError(e.message)
        setLoading(false)
      })
  }, [examId])

  return { data, loading, error }
}
