import { type SectionKey, type SectionInfo, type ExamData } from "@/types/exam"

export const SECTION_CONFIG: SectionInfo[] = [
  { key: "lesen-1", label: "Teil 1 — Headlines", groupLabel: "Leseverstehen", totalQuestions: 5 },
  { key: "lesen-2", label: "Teil 2 — Text + MCQs", groupLabel: "Leseverstehen", totalQuestions: 5 },
  { key: "lesen-3", label: "Teil 3 — Situationen + Anzeigen", groupLabel: "Leseverstehen", totalQuestions: 10 },
  { key: "sprach-1", label: "Teil 1 — Grammar Gaps", groupLabel: "Sprachbausteine", totalQuestions: 10 },
  { key: "sprach-2", label: "Teil 2 — Word Bank", groupLabel: "Sprachbausteine", totalQuestions: 10 },
  { key: "horen-1", label: "Teil 1 — Monologe", groupLabel: "Hörverstehen", totalQuestions: 5 },
  { key: "horen-2", label: "Teil 2 — Interview", groupLabel: "Hörverstehen", totalQuestions: 10 },
  { key: "horen-3", label: "Teil 3 — Durchsagen", groupLabel: "Hörverstehen", totalQuestions: 5 },
  { key: "schreiben", label: "Schreiben", groupLabel: "Schreiben", totalQuestions: 1 },
]

export function sectionLabel(key: SectionKey): string {
  return SECTION_CONFIG.find(s => s.key === key)?.label ?? key
}

export function resolveSectionData(exam: ExamData, key: SectionKey): unknown {
  const { leseverstehen, sprachbausteine, hoerverstehen, schreiben } = exam.sections
  switch (key) {
    case "lesen-1": return leseverstehen.teil1
    case "lesen-2": return leseverstehen.teil2
    case "lesen-3": return leseverstehen.teil3
    case "sprach-1": return sprachbausteine.teil1
    case "sprach-2": return sprachbausteine.teil2
    case "horen-1": return hoerverstehen.teil1
    case "horen-2": return hoerverstehen.teil2
    case "horen-3": return hoerverstehen.teil3
    case "schreiben": return schreiben
    default: {
      const _exhaustive: never = key
      throw new Error(`Unknown section key: ${_exhaustive}`)
    }
  }
}
