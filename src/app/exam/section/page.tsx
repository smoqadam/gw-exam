"use client"

import { Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useExamData } from "@/hooks/useExamData"
import { resolveSectionData, sectionLabel } from "@/lib/exam"
import { audioUrl } from "@/lib/config"
import type { SectionKey, LeseverstehenTeil1, LeseverstehenTeil2, LeseverstehenTeil3, SprachbausteineTeil1, SprachbausteineTeil2, HoerverstehenTeil, SchreibenSection } from "@/types/exam"

import HeadlineMatching from "@/components/exercises/HeadlineMatching"
import TextMCQ from "@/components/exercises/TextMCQ"
import SituationAdMatch from "@/components/exercises/SituationAdMatch"
import GapFillChoices from "@/components/exercises/GapFillChoices"
import GapFillWordBank from "@/components/exercises/GapFillWordBank"
import TrueFalseAudio from "@/components/exercises/TrueFalseAudio"
import WritingPrompt from "@/components/exercises/WritingPrompt"

function ExerciseView() {
  const params = useSearchParams()
  const examId = params.get("id") ?? ""
  const sectionKey = (params.get("section") ?? "") as SectionKey
  const { data, loading, error } = useExamData(examId)

  if (!examId || !sectionKey) return <p className="text-error text-sm">No section selected.</p>
  if (loading) return <p className="text-text-secondary text-sm">Loading...</p>
  if (error) return <p className="text-error text-sm">{error}</p>
  if (!data) return null

  const sectionData = resolveSectionData(data, sectionKey)
  const label = sectionLabel(sectionKey)

  return (
    <div className="max-w-4xl">
      <Link href={`/exam?id=${examId}`} className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary mb-4">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        Back to exam
      </Link>

      <h1 className="text-xl font-bold mb-6" style={{ fontFamily: "var(--font-serif, serif)" }}>{label}</h1>

      {sectionKey === "lesen-1" && <HeadlineMatching data={sectionData as LeseverstehenTeil1} examId={examId} sectionKey={sectionKey} />}
      {sectionKey === "lesen-2" && <TextMCQ data={sectionData as LeseverstehenTeil2} examId={examId} sectionKey={sectionKey} />}
      {sectionKey === "lesen-3" && <SituationAdMatch data={sectionData as LeseverstehenTeil3} examId={examId} sectionKey={sectionKey} />}
      {sectionKey === "sprach-1" && <GapFillChoices data={sectionData as SprachbausteineTeil1} examId={examId} sectionKey={sectionKey} />}
      {sectionKey === "sprach-2" && <GapFillWordBank data={sectionData as SprachbausteineTeil2} examId={examId} sectionKey={sectionKey} />}
      {sectionKey.startsWith("horen") && (
        <TrueFalseAudio
          data={sectionData as HoerverstehenTeil}
          examId={examId}
          sectionKey={sectionKey}
          audioSrc={audioUrl(examId, sectionKey.split("-")[1])}
        />
      )}
      {sectionKey === "schreiben" && <WritingPrompt data={sectionData as SchreibenSection} examId={examId} sectionKey={sectionKey} />}
    </div>
  )
}

export default function ExercisePage() {
  return (
    <Suspense fallback={<p className="text-text-secondary text-sm">Loading...</p>}>
      <ExerciseView />
    </Suspense>
  )
}
