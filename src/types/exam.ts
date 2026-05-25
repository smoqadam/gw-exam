export interface Headline {
  id: string
  text: string
}

export interface TextBlock {
  id: number
  content: string
}

export interface MCQQuestion {
  id: number
  stem: string
  options: Record<string, string>
  answer: string
}

export interface GapFillQuestion {
  id: number
  options: Record<string, string>
  answer: string
  grammar_point?: string
}

export interface Situation {
  id: number
  text: string
}

export interface Ad {
  id: string
  title: string
  content: string
}

export interface Statement {
  id: number
  text: string
  answer: boolean
}

export interface MonologueScript {
  statement_id: number
  speaker: string
  script: string
  justification: string
}

export interface DialogueTurn {
  speaker: string
  text: string
}

export interface DialogueScript {
  topic: string
  dialogue: DialogueTurn[]
  statement_evidence: Array<{
    statement_id: number
    answer: "richtig" | "falsch"
    quote: string
    explanation: string
  }>
}

export interface AnnouncementScript {
  statement_id: number
  setting: string
  script: string
  justification: string
}

export interface LeseverstehenTeil1 {
  headlines: Headline[]
  texts: TextBlock[]
  answers: Record<string, string>
}

export interface LeseverstehenTeil2 {
  title: string
  content: string
  questions: MCQQuestion[]
}

export interface LeseverstehenTeil3 {
  situations: Situation[]
  ads: Ad[]
  answers: Record<string, string>
}

export interface SprachbausteineTeil1 {
  context: string
  text_with_gaps: string
  questions: GapFillQuestion[]
}

export interface SprachbausteineTeil2 {
  context: string
  text_with_gaps: string
  word_bank: Record<string, string>
  answers: Record<string, string>
}

export type HoerFormat = "monologues" | "interview" | "announcements"
export type SchreibenTyp = "letter_response"

export interface HoerverstehenTeil {
  topic: string
  play_count: number
  format: HoerFormat
  audio_file: string
  audio_status: string
  generated_script:
    | { monologues: MonologueScript[] }
    | DialogueScript
    | { announcements: AnnouncementScript[] }
  speakers: string[] | Array<{ role: string; name: string; voice: string }> | undefined
  statements: Statement[]
}

export interface SchreibenSection {
  type: SchreibenTyp
  incoming_letter: {
    sender: string
    content: string
  }
  required_points: string[]
  instructions: string
  min_words: number
  rating_criteria: Record<string, string>
}

export interface ExamData {
  exam_id: string
  source: string
  level: string
  sections: {
    leseverstehen: {
      teil1: LeseverstehenTeil1
      teil2: LeseverstehenTeil2
      teil3: LeseverstehenTeil3
    }
    sprachbausteine: {
      teil1: SprachbausteineTeil1
      teil2: SprachbausteineTeil2
    }
    hoerverstehen: {
      teil1: HoerverstehenTeil
      teil2: HoerverstehenTeil
      teil3: HoerverstehenTeil
    }
    schreiben: SchreibenSection
  }
}

export type SectionKey =
  | "lesen-1" | "lesen-2" | "lesen-3"
  | "sprach-1" | "sprach-2"
  | "horen-1" | "horen-2" | "horen-3"
  | "schreiben"

export interface SectionInfo {
  key: SectionKey
  label: string
  groupLabel: string
  totalQuestions: number
}
