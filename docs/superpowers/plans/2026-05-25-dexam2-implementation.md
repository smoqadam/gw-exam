# Dexam2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Next.js SPA for German B1 vocabulary study using mock exam data with an instant dictionary, interactive exercises, and personal vocabulary tracking.

**Architecture:** Next.js App Router SPA with all data in static JSON files. Dictionary API calls cached in localStorage. Progress, notes, and saved vocabulary persisted in localStorage. Pre-generated MP3 files served from `public/audio/`.

**Tech Stack:** Next.js 14+ (App Router), Tailwind CSS, TypeScript, `dict.germanweekly.com` API

---

## File Structure

```
dexam2/
├── data/
│   └── exam_01.json          (17 total exam files in final)
├── public/
│   └── audio/
│       ├── exam_01_hoer1.mp3
│       ├── exam_01_hoer2.mp3
│       └── exam_01_hoer3.mp3
├── src/
│   ├── app/
│   │   ├── layout.tsx         → Root layout + sidebar + DictionaryProvider
│   │   ├── page.tsx           → Home: list of exams
│   │   ├── exam/
│   │   │   └── [examId]/
│   │   │       ├── page.tsx   → Exam sections list
│   │   │       └── [sectionKey]/
│   │   │           └── page.tsx → Exercise page (dynamic per section type)
│   │   ├── vocab/
│   │   │   └── page.tsx       → Saved vocabulary + flashcard drill
│   │   └── notes/
│   │       └── page.tsx       → All saved notes
│   ├── components/
│   │   ├── dictionary/
│   │   │   ├── DictionaryProvider.tsx  → React context + drawer state
│   │   │   ├── DictionaryDrawer.tsx    → Sliding drawer UI
│   │   │   └── ClickableWord.tsx       → <span> wrapper with onClick
│   │   ├── exercises/
│   │   │   ├── HeadlineMatching.tsx    → Lesen 1
│   │   │   ├── TextMCQ.tsx             → Lesen 2
│   │   │   ├── SituationAdMatch.tsx    → Lesen 3
│   │   │   ├── GapFillChoices.tsx      → Sprach 1
│   │   │   ├── GapFillWordBank.tsx     → Sprach 2
│   │   │   ├── TrueFalseAudio.tsx      → Hören 1-3
│   │   │   ├── WritingPrompt.tsx       → Schreiben
│   │   │   └── NotesTextarea.tsx       → Reusable notes
│   │   └── ui/
│   │       └── AudioPlayer.tsx         → HTML5 audio wrapper
│   ├── hooks/
│   │   ├── useLocalStorage.ts          → Generic localStorage hook
│   │   ├── useProgress.ts              → Exam progress tracking
│   │   └── useExamData.ts              → Load exam JSON
│   ├── lib/
│   │   ├── dictionary.ts               → API client + cache
│   │   ├── storage.ts                  → localStorage helpers
│   │   └── exam.ts                     → Type guards + section config
│   └── types/
│       └── exam.ts                     → All TypeScript interfaces
```

### Route Map

| Path | Page |
|------|------|
| `/` | Home — exam cards with progress bars |
| `/exam/[examId]` | Exam detail — list of sections with scores |
| `/exam/[examId]/[sectionKey]` | Exercise page for that section |
| `/vocab` | Saved vocabulary list + flashcard drill |
| `/notes` | All notes grouped by exam/section |

Section key mapping: `lesen-1`, `lesen-2`, `lesen-3`, `sprach-1`, `sprach-2`, `horen-1`, `horen-2`, `horen-3`, `schreiben`

---

### Task 1: Scaffold Next.js + Tailwind

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.js`, `tailwind.config.ts`, `postcss.config.js`, `src/app/layout.tsx`, `src/app/globals.css`

- [ ] **Step 1: Initialize project**

```bash
cd /Users/saeed/projects/dexam2
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --no-import-alias
```

- [ ] **Step 2: Verify it runs**

```bash
npm run dev
```

Expected: `http://localhost:3000` shows the default Next.js page.

- [ ] **Step 3: Build the root layout shell**

Write `src/app/layout.tsx`:

```tsx
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Dexam2 — German B1 Prep",
  description: "Study German B1 vocabulary with mock exam exercises",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
```

Write `src/app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 4: Copy exam JSON and audio**

```bash
cp /Users/saeed/projects/dexam2/exam_01.json /Users/saeed/projects/dexam2/data/
cp /Users/saeed/projects/dexam2/audio/*.mp3 /Users/saeed/projects/dexam2/public/audio/
```

---

### Task 2: TypeScript Types

**Files:**
- Create: `src/types/exam.ts`
- Create: `src/lib/exam.ts`

- [ ] **Step 1: Define types**

Write `src/types/exam.ts`:

```ts
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
    answer: string
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

export interface HoerverstehenTeil {
  topic: string
  play_count: number
  format: string
  audio_file: string
  audio_status: string
  generated_script: MonologueScript[] | DialogueScript | AnnouncementScript[]
  speakers: unknown
  statements: Statement[]
}

export interface SchreibenSection {
  type: string
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
```

- [ ] **Step 2: Write section config**

Write `src/lib/exam.ts`:

```ts
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
  }
}
```

---

### Task 3: Dictionary System

**Files:**
- Create: `src/lib/dictionary.ts`
- Create: `src/components/dictionary/DictionaryProvider.tsx`
- Create: `src/components/dictionary/DictionaryDrawer.tsx`
- Create: `src/components/dictionary/ClickableWord.tsx`

- [ ] **Step 1: Write the API client + cache**

Write `src/lib/dictionary.ts`:

```ts
export interface DictionaryEntry {
  word: string
  lemma: string | null
  article: string | null
  part_of_speech: string
  ipa: string | null
  german_definition: string
  english_translations: string[]
  grammar_notes: string | null
  plural: string | null
  conjugation: string | null
  examples: Array<{ de: string; en: string }>
  related_words: string[]
}

export interface LookupResult {
  entry: DictionaryEntry
  cached: boolean
}

const CACHE_KEY = "dict_cache"
const API_BASE = "https://dict.germanweekly.com/api/lookup"

function getCache(): Record<string, DictionaryEntry> {
  if (typeof window === "undefined") return {}
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || "{}")
  } catch {
    return {}
  }
}

function setCache(cache: Record<string, DictionaryEntry>): void {
  localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
}

export async function lookupWord(word: string): Promise<LookupResult> {
  const cache = getCache()
  const cached = cache[word.toLowerCase()]
  if (cached) return { entry: cached, cached: true }

  const res = await fetch(`${API_BASE}/${encodeURIComponent(word)}`)
  if (!res.ok) throw new Error(`Lookup failed: ${res.statusText}`)
  const data: LookupResult = await res.json()

  const newCache = { ...getCache(), [word.toLowerCase()]: data.entry }
  setCache(newCache)
  return data
}
```

- [ ] **Step 2: Write DictionaryProvider (React context + drawer state)**

Write `src/components/dictionary/DictionaryProvider.tsx`:

```tsx
"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import { type DictionaryEntry } from "@/lib/dictionary"
import DictionaryDrawer from "./DictionaryDrawer"

interface DictContextValue {
  lookupWord: string
  openDictionary: (word: string) => void
  closeDictionary: () => void
}

const DictContext = createContext<DictContextValue>({
  lookupWord: "",
  openDictionary: () => {},
  closeDictionary: () => {},
})

export function useDictionary() {
  return useContext(DictContext)
}

export function DictionaryProvider({ children }: { children: ReactNode }) {
  const [lookupWord, setLookupWord] = useState("")
  const [isOpen, setIsOpen] = useState(false)

  const openDictionary = useCallback((word: string) => {
    setLookupWord(word)
    setIsOpen(true)
  }, [])

  const closeDictionary = useCallback(() => {
    setIsOpen(false)
  }, [])

  return (
    <DictContext.Provider value={{ lookupWord, openDictionary, closeDictionary }}>
      {children}
      <DictionaryDrawer isOpen={isOpen} onClose={closeDictionary} initialWord={lookupWord} />
    </DictContext.Provider>
  )
}
```

- [ ] **Step 3: Write DictionaryDrawer**

Write `src/components/dictionary/DictionaryDrawer.tsx`:

```tsx
"use client"

import { useState, useEffect, useCallback } from "react"
import { lookupWord, type DictionaryEntry } from "@/lib/dictionary"
import { useLocalStorage } from "@/hooks/useLocalStorage"

interface Props {
  isOpen: boolean
  onClose: () => void
  initialWord: string
}

export default function DictionaryDrawer({ isOpen, onClose, initialWord }: Props) {
  const [query, setQuery] = useState(initialWord)
  const [entry, setEntry] = useState<DictionaryEntry | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [savedWords, setSavedWords] = useLocalStorage<string[]>("saved_vocab", [])
  const [wordEntries, setWordEntries] = useLocalStorage<Record<string, DictionaryEntry>>("vocab_entries", {})

  useEffect(() => {
    setQuery(initialWord)
    if (initialWord) {
      setLoading(true)
      setError("")
      lookupWord(initialWord)
        .then(res => setEntry(res.entry))
        .catch(e => setError(e.message))
        .finally(() => setLoading(false))
    }
  }, [initialWord])

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return
    setLoading(true)
    setError("")
    try {
      const res = await lookupWord(query.trim())
      setEntry(res.entry)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }, [query])

  const saveWord = useCallback(() => {
    if (!entry) return
    if (!savedWords.includes(entry.word)) {
      setSavedWords([...savedWords, entry.word])
      setWordEntries({ ...wordEntries, [entry.word]: entry })
    }
  }, [entry, savedWords, wordEntries, setSavedWords, setWordEntries])

  const isSaved = entry ? savedWords.includes(entry.word) : false

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/30" onClick={onClose} />
      <div className="w-80 bg-white shadow-xl flex flex-col border-l overflow-y-auto">
        <div className="flex items-center justify-between p-3 border-b">
          <h2 className="font-semibold text-sm">Dictionary</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="p-3 border-b">
          <div className="relative">
            <svg className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              className="w-full pl-8 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Type a German word..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
            />
          </div>
        </div>

        <div className="flex-1 p-3">
          {loading && <p className="text-sm text-gray-500">Looking up...</p>}
          {error && <p className="text-sm text-red-500">{error}</p>}
          {entry && !loading && (
            <div className="space-y-3">
              <div>
                <div className="text-lg font-bold">{entry.word}</div>
                <div className="text-sm text-gray-500">
                  {entry.ipa && `${entry.ipa} · `}{entry.part_of_speech}
                  {entry.article && ` · ${entry.article}`}
                </div>
                {entry.lemma && (
                  <div className="text-xs text-gray-400 mt-1">
                    Lemma: <em>{entry.lemma}</em>
                  </div>
                )}
              </div>

              <div>
                <div className="text-sm font-medium text-gray-700">English</div>
                <div className="text-sm">{entry.english_translations.join(", ")}</div>
              </div>

              {entry.german_definition && (
                <div>
                  <div className="text-sm font-medium text-gray-700">Definition</div>
                  <div className="text-sm">{entry.german_definition}</div>
                </div>
              )}

              {entry.grammar_notes && (
                <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                  {entry.grammar_notes}
                </div>
              )}

              {entry.conjugation && (
                <div>
                  <div className="text-sm font-medium text-gray-700">Conjugation</div>
                  <div className="text-xs text-gray-600">{entry.conjugation}</div>
                </div>
              )}

              {entry.plural && (
                <div>
                  <div className="text-sm font-medium text-gray-700">Plural</div>
                  <div className="text-xs text-gray-600">{entry.plural}</div>
                </div>
              )}

              {entry.examples.length > 0 && (
                <div>
                  <div className="text-sm font-medium text-gray-700">Examples</div>
                  {entry.examples.map((ex, i) => (
                    <div key={i} className="mt-1 text-sm">
                      <p className="text-gray-800">{ex.de}</p>
                      <p className="text-gray-500 text-xs">{ex.en}</p>
                    </div>
                  ))}
                </div>
              )}

              {entry.related_words.length > 0 && (
                <div>
                  <div className="text-sm font-medium text-gray-700">Related</div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {entry.related_words.map(w => (
                      <span key={w} className="px-2 py-0.5 bg-gray-100 rounded text-xs">{w}</span>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={saveWord}
                disabled={isSaved}
                className={`w-full py-2 rounded-lg text-sm flex items-center justify-center gap-2 ${
                  isSaved
                    ? "bg-green-50 text-green-600 border border-green-200"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                </svg>
                {isSaved ? "Saved to vocab" : "Save to my vocab"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Write ClickableWord**

Write `src/components/dictionary/ClickableWord.tsx`:

```tsx
"use client"

import { useDictionary } from "./DictionaryProvider"

const GERMAN_REGEX = /^[A-Za-zÄÖÜäöüß-]+$/

export default function ClickableWord({ word }: { word: string }) {
  const { openDictionary } = useDictionary()
  const isGerman = GERMAN_REGEX.test(word) && word.length > 1

  if (!isGerman) {
    return <span>{word}</span>
  }

  return (
    <span
      onClick={() => openDictionary(word)}
      className="cursor-pointer hover:text-blue-600 hover:underline decoration-dotted underline-offset-2 transition-colors"
    >
      {word}
    </span>
  )
}

export function renderTextWithClicks(text: string): React.ReactNode[] {
  return text.split(/(\s+)/).map((part, i) => {
    if (part.trim() === "") {
      return <span key={i}>{part}</span>
    }
    return <ClickableWord key={i} word={part} />
  })
}
```

---

### Task 4: Hooks

**Files:**
- Create: `src/hooks/useLocalStorage.ts`
- Create: `src/hooks/useProgress.ts`
- Create: `src/hooks/useExamData.ts`

- [ ] **Step 1: Write useLocalStorage**

Write `src/hooks/useLocalStorage.ts`:

```ts
"use client"

import { useState, useCallback } from "react"

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    setStoredValue(prev => {
      const next = value instanceof Function ? value(prev) : value
      localStorage.setItem(key, JSON.stringify(next))
      return next
    })
  }, [key])

  return [storedValue, setValue]
}
```

- [ ] **Step 2: Write useExamData**

Write `src/hooks/useExamData.ts`:

```ts
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
```

- [ ] **Step 3: Write useProgress**

Write `src/hooks/useProgress.ts`:

```ts
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
```

---

### Task 5: Reusable Components

**Files:**
- Create: `src/components/exercises/NotesTextarea.tsx`
- Create: `src/components/ui/AudioPlayer.tsx`

- [ ] **Step 1: Write NotesTextarea**

Write `src/components/exercises/NotesTextarea.tsx`:

```tsx
"use client"

import { useLocalStorage } from "@/hooks/useLocalStorage"

interface Props {
  examId: string
  sectionKey: string
  questionId?: number
}

export default function NotesTextarea({ examId, sectionKey, questionId }: Props) {
  const storageKey = `notes_${examId}_${sectionKey}${questionId ? `_${questionId}` : ""}`
  const [note, setNote] = useLocalStorage(storageKey, "")

  return (
    <div className="relative">
      <svg className="absolute top-3 left-3 w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
      </svg>
      <textarea
        className="w-full border rounded-lg p-3 pl-9 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
        rows={3}
        placeholder="Take notes..."
        value={note}
        onChange={e => setNote(e.target.value)}
      />
    </div>
  )
}
```

- [ ] **Step 2: Write AudioPlayer**

Write `src/components/ui/AudioPlayer.tsx`:

```tsx
"use client"

import { useRef, useState } from "react"

interface Props {
  src: string
}

export default function AudioPlayer({ src }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  const toggle = () => {
    if (!audioRef.current) return
    if (playing) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setPlaying(!playing)
  }

  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
      <button
        onClick={toggle}
        className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600 transition-colors flex-shrink-0"
      >
        {playing ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3"/>
          </svg>
        )}
      </button>
      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 rounded-full transition-all"
          style={{ width: duration ? `${(currentTime / duration) * 100}%` : "0%" }}
        />
      </div>
      <span className="text-xs text-gray-500 w-16 text-right tabular-nums">
        {Math.floor(currentTime / 60)}:{String(Math.floor(currentTime % 60)).padStart(2, "0")} / {Math.floor(duration / 60)}:{String(Math.floor(duration % 60)).padStart(2, "0")}
      </span>
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime ?? 0)}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration ?? 0)}
        onEnded={() => setPlaying(false)}
      />
    </div>
  )
}
```

---

### Task 6: Leseverstehen Teil 1 (Headline Matching)

**Files:**
- Create: `src/components/exercises/HeadlineMatching.tsx`

- [ ] **Step 1: Write the component**

Write `src/components/exercises/HeadlineMatching.tsx`:

```tsx
"use client"

import { useState } from "react"
import type { LeseverstehenTeil1 } from "@/types/exam"
import { renderTextWithClicks } from "../dictionary/ClickableWord"
import NotesTextarea from "./NotesTextarea"

interface Props {
  data: LeseverstehenTeil1
  examId: string
  sectionKey: string
}

export default function HeadlineMatching({ data, examId, sectionKey }: Props) {
  const [matches, setMatches] = useState<Record<number, string>>({})
  const [checked, setChecked] = useState(false)

  const handleMatch = (textId: number, headlineId: string) => {
    setMatches(prev => ({ ...prev, [textId]: headlineId }))
  }

  const check = () => {
    setChecked(true)
  }

  const score = checked
    ? data.texts.filter(t => matches[t.id] === data.answers[String(t.id)]).length
    : 0

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <h3 className="font-semibold text-sm text-gray-500 uppercase tracking-wide mb-3">Headlines</h3>
          <div className="space-y-1">
            {data.headlines.map(h => (
              <div
                key={h.id}
                className="px-3 py-2 rounded-lg text-sm bg-gray-50 font-medium"
              >
                <span className="text-gray-400 mr-2">{h.id})</span>
                {renderTextWithClicks(h.text)}
              </div>
            ))}
          </div>
        </div>
        <div className="lg:col-span-2">
          <h3 className="font-semibold text-sm text-gray-500 uppercase tracking-wide mb-3">Texts</h3>
          <div className="space-y-4">
            {data.texts.map(t => (
              <div key={t.id} className="border rounded-lg p-4">
                <div className="flex gap-4">
                  <span className="font-semibold text-gray-400 shrink-0">Text {t.id}</span>
                  <p className="text-sm leading-relaxed">{renderTextWithClicks(t.content)}</p>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 items-center">
                  {data.headlines.map(h => {
                    const isSelected = matches[t.id] === h.id
                    const isCorrect = checked && data.answers[String(t.id)] === h.id
                    const isWrong = checked && isSelected && !isCorrect
                    let btnClass = "px-3 py-1 rounded text-sm border transition-colors "
                    if (isSelected && !checked) btnClass += "border-blue-500 bg-blue-50 text-blue-700"
                    else if (isCorrect) btnClass += "border-green-500 bg-green-50 text-green-700"
                    else if (isWrong) btnClass += "border-red-500 bg-red-50 text-red-700"
                    else btnClass += "border-gray-200 hover:border-gray-300 text-gray-600"
                    return (
                      <button
                        key={h.id}
                        onClick={() => handleMatch(t.id, h.id)}
                        className={btnClass}
                      >
                        {h.id}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          {!checked ? (
            <button onClick={check} className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm">
              Check answers
            </button>
          ) : (
            <div className="mt-4 p-4 rounded-lg bg-gray-50 text-sm">
              Score: {score} / {data.texts.length}
            </div>
          )}
        </div>
      </div>

      <NotesTextarea examId={examId} sectionKey={sectionKey} />
    </div>
  )
}
```

---

### Task 7: Leseverstehen Teil 2 (Text + MCQ)

**Files:**
- Create: `src/components/exercises/TextMCQ.tsx`

- [ ] **Step 1: Write the component**

Write `src/components/exercises/TextMCQ.tsx`:

```tsx
"use client"

import { useState } from "react"
import type { LeseverstehenTeil2 } from "@/types/exam"
import { renderTextWithClicks } from "../dictionary/ClickableWord"
import NotesTextarea from "./NotesTextarea"

interface Props {
  data: LeseverstehenTeil2
  examId: string
  sectionKey: string
}

export default function TextMCQ({ data, examId, sectionKey }: Props) {
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [checked, setChecked] = useState(false)

  const select = (qId: number, opt: string) => {
    if (checked) return
    setAnswers(prev => ({ ...prev, [qId]: opt }))
  }

  const check = () => setChecked(true)

  const score = checked
    ? data.questions.filter(q => answers[q.id] === q.answer).length
    : 0

  return (
    <div className="space-y-6">
      <details className="border rounded-lg" open>
        <summary className="font-semibold p-4 cursor-pointer hover:bg-gray-50">{data.title}</summary>
        <div className="px-4 pb-4 text-sm leading-relaxed max-h-80 overflow-y-auto">
          {renderTextWithClicks(data.content)}
        </div>
      </details>

      <div className="space-y-6">
        {data.questions.map(q => (
          <div key={q.id} className="border rounded-lg p-4">
            <p className="font-medium text-sm mb-3">{renderTextWithClicks(q.stem)}</p>
            <div className="space-y-2">
              {Object.entries(q.options).map(([key, text]) => {
                const isSelected = answers[q.id] === key
                const isCorrect = checked && q.answer === key
                const isWrong = checked && isSelected && !isCorrect
                let optClass = "flex items-center gap-3 p-3 rounded-lg border text-sm cursor-pointer transition-colors "
                if (isSelected && !checked) optClass += "border-blue-500 bg-blue-50"
                else if (isCorrect) optClass += "border-green-500 bg-green-50"
                else if (isWrong) optClass += "border-red-500 bg-red-50"
                else optClass += "border-gray-200 hover:border-gray-300"
                return (
                  <div key={key} onClick={() => select(q.id, key)} className={optClass}>
                    <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-xs font-medium shrink-0">
                      {key}
                    </span>
                    <span>{renderTextWithClicks(text)}</span>
                  </div>
                )
              })}
            </div>
            <NotesTextarea examId={examId} sectionKey={sectionKey} questionId={q.id} />
          </div>
        ))}
      </div>

      {!checked ? (
        <button onClick={check} className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm">
          Check answers
        </button>
      ) : (
        <div className="p-4 rounded-lg bg-gray-50 text-sm">
          Score: {score} / {data.questions.length}
        </div>
      )}
    </div>
  )
}
```

---

### Task 8: Leseverstehen Teil 3 (Situation-Ad Matching)

**Files:**
- Create: `src/components/exercises/SituationAdMatch.tsx`

- [ ] **Step 1: Write the component**

Write `src/components/exercises/SituationAdMatch.tsx`:

```tsx
"use client"

import { useState } from "react"
import type { LeseverstehenTeil3 } from "@/types/exam"
import { renderTextWithClicks } from "../dictionary/ClickableWord"
import NotesTextarea from "./NotesTextarea"

interface Props {
  data: LeseverstehenTeil3
  examId: string
  sectionKey: string
}

export default function SituationAdMatch({ data, examId, sectionKey }: Props) {
  const [matches, setMatches] = useState<Record<number, string>>({})
  const [checked, setChecked] = useState(false)

  const select = (situationId: number, adId: string) => {
    if (checked) return
    setMatches(prev => ({ ...prev, [situationId]: adId }))
  }

  const selectedAd = matches[data.situations[0]?.id]
  const previewAd = selectedAd ? data.ads.find(a => a.id === selectedAd) : null

  const check = () => setChecked(true)

  const score = checked
    ? data.situations.filter(s => matches[s.id] === data.answers[String(s.id)]).length
    : 0

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-500">Match each situation to the most suitable ad.</p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          {data.situations.map(s => (
            <div key={s.id} className="border rounded-lg p-4">
              <div className="flex gap-3 items-start">
                <span className="font-semibold text-gray-400 shrink-0 text-sm">{s.id}.</span>
                <p className="text-sm">{renderTextWithClicks(s.text)}</p>
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {data.ads.map(a => {
                  const isSelected = matches[s.id] === a.id
                  const isCorrect = checked && data.answers[String(s.id)] === a.id
                  const isWrong = checked && isSelected && !isCorrect
                  let btnClass = "px-2 py-0.5 rounded text-xs border transition-colors "
                  if (isSelected && !checked) btnClass += "border-blue-500 bg-blue-50 text-blue-700"
                  else if (isCorrect) btnClass += "border-green-500 bg-green-50 text-green-700"
                  else if (isWrong) btnClass += "border-red-500 bg-red-50 text-red-700"
                  else btnClass += "border-gray-200 hover:border-gray-300"
                  return (
                    <button key={a.id} onClick={() => select(s.id, a.id)} className={btnClass}>
                      {a.id}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-3">
          <h3 className="font-semibold text-sm text-gray-500 uppercase tracking-wide">Ads</h3>
          {data.ads.map(a => {
            const isAssigned = Object.values(matches).includes(a.id)
            return (
              <div
                key={a.id}
                className={`border rounded-lg p-3 text-sm transition-colors ${
                  isAssigned ? "border-blue-300 bg-blue-50" : ""
                }`}
              >
                <div className="font-semibold text-xs text-gray-400 mb-1">{a.id}</div>
                <div className="font-medium">{renderTextWithClicks(a.title)}</div>
                <p className="text-gray-600 text-xs mt-1">{renderTextWithClicks(a.content)}</p>
              </div>
            )
          })}
        </div>
      </div>

      <NotesTextarea examId={examId} sectionKey={sectionKey} />

      {!checked ? (
        <button onClick={check} className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm">
          Check answers
        </button>
      ) : (
        <div className="p-4 rounded-lg bg-gray-50 text-sm">
          Score: {score} / {data.situations.length}
        </div>
      )}
    </div>
  )
}
```

---

### Task 9: Sprachbausteine

**Files:**
- Create: `src/components/exercises/GapFillChoices.tsx`
- Create: `src/components/exercises/GapFillWordBank.tsx`

- [ ] **Step 1: Write GapFillChoices**

Write `src/components/exercises/GapFillChoices.tsx`:

```tsx
"use client"

import { useState } from "react"
import type { SprachbausteineTeil1 } from "@/types/exam"
import { renderTextWithClicks } from "../dictionary/ClickableWord"
import NotesTextarea from "./NotesTextarea"

interface Props {
  data: SprachbausteineTeil1
  examId: string
  sectionKey: string
}

export default function GapFillChoices({ data, examId, sectionKey }: Props) {
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [submitted, setSubmitted] = useState<Record<number, boolean>>({})

  const select = (qId: number, opt: string) => {
    setAnswers(prev => ({ ...prev, [qId]: opt }))
  }

  const submit = (qId: number) => {
    setSubmitted(prev => ({ ...prev, [qId]: true }))
  }

  const allSubmitted = data.questions.every(q => submitted[q.id])
  const correctCount = allSubmitted
    ? data.questions.filter(q => answers[q.id] === q.answer).length
    : 0

  const renderGapText = () => {
    const parts = data.text_with_gaps.split(/\[(\d+)\]/)
    return parts.map((part, i) => {
      if (i % 2 === 0) {
        return <span key={i}>{renderTextWithClicks(part)}</span>
      }
      const qId = Number(part)
      const question = data.questions.find(q => q.id === qId)
      if (!question) return <span key={i}>[{qId}]</span>
      const selected = answers[qId]
      const isSubmitted = submitted[qId]
      const isCorrect = answers[qId] === question.answer
      return (
        <span key={i} className="inline-flex items-center gap-1 mx-1">
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border-2 text-sm font-medium cursor-pointer transition-colors ${
              isSubmitted && isCorrect ? "border-green-500 bg-green-50 text-green-700" :
              isSubmitted && !isCorrect ? "border-red-500 bg-red-50 text-red-700" :
              selected ? "border-blue-500 bg-blue-50 text-blue-700" :
              "border-dashed border-gray-300 text-gray-400"
            }`}
            onClick={() => submit(qId)}
          >
            {selected ? question.options[selected] : `[${qId}]`}
          </span>
          {isSubmitted && !isCorrect && (
            <span className="text-xs text-green-600 font-medium ml-1">
              → {question.options[question.answer]}
            </span>
          )}
        </span>
      )
    })
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-500 italic">{data.context}</p>

      <div className="border rounded-lg p-6 text-sm leading-loose bg-white">
        {renderGapText()}
      </div>

      <div className="space-y-4">
        {data.questions.map(q => (
          <div key={q.id} className="border rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <span className="font-semibold text-sm text-gray-400">Question {q.id}</span>
              <div className="flex gap-2">
                {Object.entries(q.options).map(([key, text]) => {
                  const isSelected = answers[q.id] === key
                  const isSubmitted = submitted[q.id]
                  const isCorrect = q.answer === key
                  let btnClass = "px-4 py-1.5 rounded-lg text-sm border transition-colors "
                  if (isSubmitted && isCorrect) btnClass += "border-green-500 bg-green-50 text-green-700"
                  else if (isSubmitted && isSelected && !isCorrect) btnClass += "border-red-500 bg-red-50 text-red-700"
                  else if (isSelected) btnClass += "border-blue-500 bg-blue-50 text-blue-700"
                  else btnClass += "border-gray-200 hover:border-gray-300"
                  return (
                    <button key={key} onClick={() => select(q.id, key)} className={btnClass}>
                      {key}) {text}
                    </button>
                  )
                })}
              </div>
            </div>

            {!submitted[q.id] ? (
              <button
                onClick={() => submit(q.id)}
                disabled={!answers[q.id]}
                className="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 disabled:opacity-50"
              >
                Submit
              </button>
            ) : (
              <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-sm">
                <p className="font-medium text-green-700">
                  {answers[q.id] === q.answer ? "✓ Correct" : "✗ Incorrect"}
                </p>
                {q.grammar_point && (
                  <p className="mt-1 text-green-600 text-xs">{q.grammar_point}</p>
                )}
              </div>
            )}

            <NotesTextarea examId={examId} sectionKey={sectionKey} questionId={q.id} />
          </div>
        ))}
      </div>

      {allSubmitted && (
        <div className="p-4 rounded-lg bg-gray-50 text-sm">
          Score: {correctCount} / {data.questions.length}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Write GapFillWordBank**

Write `src/components/exercises/GapFillWordBank.tsx`:

```tsx
"use client"

import { useState, useMemo } from "react"
import type { SprachbausteineTeil2 } from "@/types/exam"
import { renderTextWithClicks } from "../dictionary/ClickableWord"
import NotesTextarea from "./NotesTextarea"

interface Props {
  data: SprachbausteineTeil2
  examId: string
  sectionKey: string
}

const WORD_BANK_LABELS: Record<string, string> = {
  a: "AM", b: "AUFTRAG", c: "FRAGEN", d: "GEEIGNET",
  e: "GEGEUBER", f: "INFORMATIONEN", g: "KÖNNTEN", h: "NENNEN",
  i: "NUN", j: "STATTFINDEN", k: "TERMIN", l: "TROTZDEM",
  m: "VOR", n: "WÄREN", o: "WEGEN",
}

const GAP_IDS = [31, 32, 33, 34, 35, 36, 37, 38, 39, 40]

export default function GapFillWordBank({ data, examId, sectionKey }: Props) {
  const [assignments, setAssignments] = useState<Record<number, string>>({})
  const [usedWords, setUsedWords] = useState<Set<string>>(new Set())
  const [checked, setChecked] = useState(false)

  const wordBankEntries = useMemo(() => Object.entries(data.word_bank), [data.word_bank])

  const assign = (gapId: number, wordKey: string) => {
    if (checked) return
    setAssignments(prev => {
      const oldKey = prev[gapId]
      const newUsed = new Set(usedWords)
      if (oldKey) newUsed.delete(oldKey)
      newUsed.add(wordKey)
      setUsedWords(newUsed)
      return { ...prev, [gapId]: wordKey }
    })
  }

  const getGapsFromText = () => {
    const parts = data.text_with_gaps.split(/\[(\d+)\]/)
    return parts.map((part, i) => {
      if (i % 2 === 0) return <span key={i}>{renderTextWithClicks(part)}</span>
      const gapId = Number(part)
      const assigned = assignments[gapId]
      const correct = data.answers[String(gapId)]
      const isCorrect = checked && assigned === correct
      const isWrong = checked && assigned && assigned !== correct
      return (
        <span key={i} className={`inline-flex items-center mx-1 px-2 py-0.5 rounded border-2 text-sm font-medium ${
          isCorrect ? "border-green-500 bg-green-50 text-green-700" :
          isWrong ? "border-red-500 bg-red-50 text-red-700" :
          assigned ? "border-blue-500 bg-blue-50 text-blue-700" :
          "border-dashed border-gray-300 text-gray-400"
        }`}>
          {assigned ? WORD_BANK_LABELS[assigned] ?? assigned : `[${gapId}]`}
        </span>
      )
    })
  }

  const check = () => setChecked(true)
  const score = checked ? GAP_IDS.filter(id => assignments[id] === data.answers[String(id)]).length : 0

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-500 italic">{data.context}</p>

      <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-lg">
        {wordBankEntries.map(([key, word]) => {
          const isUsed = usedWords.has(key)
          return (
            <button
              key={key}
              onClick={() => {
                if (!checked && isUsed) {
                  setUsedWords(prev => { const n = new Set(prev); n.delete(key); return n })
                  setAssignments(prev => {
                    const n = { ...prev }
                    for (const [g, w] of Object.entries(n)) { if (w === key) { delete n[Number(g)]; break } }
                    return n
                  })
                }
              }}
              className={`px-3 py-1 rounded text-sm font-mono transition-colors ${
                isUsed ? "bg-blue-100 text-blue-700 border border-blue-300" : "bg-white border border-gray-200 hover:border-gray-300"
              }`}
            >
              {word}
            </button>
          )
        })}
      </div>

      <div className="border rounded-lg p-6 text-sm leading-loose bg-white">
        {getGapsFromText()}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {GAP_IDS.map(gapId => (
          <div key={gapId} className="border rounded-lg p-3 text-center">
            <div className="text-xs text-gray-400 mb-1">#{gapId}</div>
            <select
              className="w-full text-sm border rounded p-1"
              value={assignments[gapId] || ""}
              onChange={e => assign(gapId, e.target.value)}
              disabled={checked}
            >
              <option value="">---</option>
              {wordBankEntries.map(([key, word]) => (
                <option key={key} value={key} disabled={usedWords.has(key) && assignments[gapId] !== key}>
                  {word}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      <NotesTextarea examId={examId} sectionKey={sectionKey} />

      {!checked ? (
        <button onClick={check} className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm">
          Check answers
        </button>
      ) : (
        <div className="p-4 rounded-lg bg-gray-50 text-sm">
          Score: {score} / {GAP_IDS.length}
        </div>
      )}
    </div>
  )
}
```

---

### Task 10: Hörverstehen

**Files:**
- Create: `src/components/exercises/TrueFalseAudio.tsx`

- [ ] **Step 1: Write TrueFalseAudio**

Write `src/components/exercises/TrueFalseAudio.tsx`:

```tsx
"use client"

import { useState } from "react"
import type { HoerverstehenTeil } from "@/types/exam"
import AudioPlayer from "../ui/AudioPlayer"
import NotesTextarea from "./NotesTextarea"

interface Props {
  data: HoerverstehenTeil
  examId: string
  sectionKey: string
  audioSrc: string
}

export default function TrueFalseAudio({ data, examId, sectionKey, audioSrc }: Props) {
  const [answers, setAnswers] = useState<Record<number, boolean>>({})
  const [checked, setChecked] = useState(false)

  const select = (qId: number, value: boolean) => {
    if (checked) return
    setAnswers(prev => ({ ...prev, [qId]: value }))
  }

  const check = () => setChecked(true)

  const score = checked
    ? data.statements.filter(s => answers[s.id] === s.answer).length
    : 0

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-gray-500 mb-3">{data.topic} · Play count: {data.play_count}</p>
        <AudioPlayer src={audioSrc} />
      </div>

      <div className="space-y-3">
        {data.statements.map(s => {
          const selected = answers[s.id]
          const isCorrect = checked && selected === s.answer
          const isWrong = checked && selected !== undefined && selected !== s.answer
          return (
            <div
              key={s.id}
              className={`border rounded-lg p-4 transition-colors ${
                isCorrect ? "border-green-300 bg-green-50" :
                isWrong ? "border-red-300 bg-red-50" :
                "border-gray-200"
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="font-semibold text-gray-400 shrink-0 text-sm">{s.id}.</span>
                <p className="flex-1 text-sm">{s.text}</p>
                <div className="flex gap-2 shrink-0">
                  {["richtig", "falsch"].map(label => {
                    const value = label === "richtig"
                    const isActive = selected === value
                    let btnClass = "px-4 py-1.5 rounded-lg text-sm font-medium border transition-colors "
                    if (checked && isActive && isCorrect) btnClass += "border-green-500 bg-green-100 text-green-700"
                    else if (checked && isActive && isWrong) btnClass += "border-red-500 bg-red-100 text-red-700"
                    else if (isActive) btnClass += "border-blue-500 bg-blue-50 text-blue-700"
                    else btnClass += "border-gray-200 text-gray-500 hover:border-gray-300"
                    return (
                      <button key={label} onClick={() => select(s.id, value)} className={btnClass}>
                        {label.charAt(0).toUpperCase() + label.slice(1)}
                      </button>
                    )
                  })}
                </div>
              </div>
              <NotesTextarea examId={examId} sectionKey={sectionKey} questionId={s.id} />
            </div>
          )
        })}
      </div>

      {!checked ? (
        <button onClick={check} className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm">
          Check answers
        </button>
      ) : (
        <div className="p-4 rounded-lg bg-gray-50 text-sm">
          Score: {score} / {data.statements.length}
        </div>
      )}
    </div>
  )
}
```

---

### Task 11: Schreiben (Writing)

**Files:**
- Create: `src/components/exercises/WritingPrompt.tsx`

- [ ] **Step 1: Write the component**

Write `src/components/exercises/WritingPrompt.tsx`:

```tsx
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
      <div className="border rounded-lg p-4 bg-gray-50">
        <div className="flex items-center gap-2 mb-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
            <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/>
          </svg>
          <span className="font-semibold text-sm">Incoming letter from {data.incoming_letter.sender}</span>
        </div>
        <p className="text-sm leading-relaxed whitespace-pre-line">{renderTextWithClicks(data.incoming_letter.content)}</p>
      </div>

      <div>
        <h3 className="font-semibold text-sm text-gray-500 uppercase tracking-wide mb-2">Required points</h3>
        <div className="flex flex-wrap gap-2">
          {data.required_points.map(point => (
            <button
              key={point}
              onClick={() => togglePoint(point)}
              className={`px-3 py-1.5 rounded-lg text-sm border transition-colors flex items-center gap-2 ${
                checkedPoints.includes(point)
                  ? "border-green-400 bg-green-50 text-green-700"
                  : "border-gray-200 text-gray-600 hover:border-gray-300"
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
          className="w-full border rounded-lg p-4 text-sm resize-y leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[300px]"
          placeholder="Write your letter here..."
          value={draft}
          onChange={e => setDraft(e.target.value)}
        />
        <div className="flex justify-between items-center mt-2 text-sm">
          <span className={wordCount >= data.min_words ? "text-green-600" : "text-gray-400"}>
            {wordCount} words {wordCount < data.min_words ? `(min ${data.min_words})` : "✓ minimum met"}
          </span>
          <button
            onClick={() => setDraft("")}
            className="text-gray-400 hover:text-gray-600 text-xs"
          >
            Clear draft
          </button>
        </div>
      </div>
    </div>
  )
}
```

---

### Task 12: Pages — Home + Exam List + Section Exercises

**Files:**
- Modify: `src/app/layout.tsx`
- Create: `src/app/page.tsx`
- Create: `src/app/exam/[examId]/page.tsx`
- Create: `src/app/exam/[examId]/[sectionKey]/page.tsx`
- Create: `src/components/layout/Sidebar.tsx`

- [ ] **Step 1: Write Sidebar**

Write `src/components/layout/Sidebar.tsx`:

```tsx
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const NAV_ITEMS = [
  { href: "/", label: "Exams", icon: "M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" },
  { href: "/vocab", label: "My Vocab", icon: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" },
  { href: "/notes", label: "My Notes", icon: "M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-56 border-r bg-white flex flex-col shrink-0">
      <div className="p-4 border-b">
        <Link href="/" className="flex items-center gap-2 font-semibold text-gray-800">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
          </svg>
          Dexam2
        </Link>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {NAV_ITEMS.map(item => {
          const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                active
                  ? "bg-blue-50 text-blue-700 font-medium"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d={item.icon}/>
              </svg>
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
```

- [ ] **Step 2: Update Layout**

Write `src/app/layout.tsx`:

```tsx
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import ClientLayout from "./client-layout"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Dexam2 — German B1 Prep",
  description: "Study German B1 vocabulary with mock exam exercises",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50`}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}
```

Write `src/app/client-layout.tsx`:

```tsx
"use client"

import Sidebar from "@/components/layout/Sidebar"
import { DictionaryProvider } from "@/components/dictionary/DictionaryProvider"

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <DictionaryProvider>
      <div className="flex h-screen">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          {children}
        </main>
      </div>
    </DictionaryProvider>
  )
}
```

- [ ] **Step 3: Write Home Page**

Write `src/app/page.tsx`:

```tsx
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
```

- [ ] **Step 4: Write Exam Page**

Write `src/app/exam/[examId]/page.tsx`:

```tsx
"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { useExamData } from "@/hooks/useExamData"
import { useProgress } from "@/hooks/useProgress"
import { SECTION_CONFIG, sectionLabel } from "@/lib/exam"
import type { SectionKey } from "@/types/exam"

export default function ExamPage() {
  const params = useParams()
  const examId = params.examId as string
  const { data, loading, error } = useExamData(examId)
  const { getSectionScore } = useProgress(examId)

  if (loading) return <p className="text-gray-500 text-sm">Loading exam...</p>
  if (error) return <p className="text-red-500 text-sm">{error}</p>
  if (!data) return null

  const grouped = SECTION_CONFIG.reduce<Record<string, typeof SECTION_CONFIG>>((acc, s) => {
    if (!acc[s.groupLabel]) acc[s.groupLabel] = []
    acc[s.groupLabel].push(s)
    return acc
  }, {})

  return (
    <div className="max-w-2xl">
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        Back to exams
      </Link>

      <h1 className="text-2xl font-bold mb-1">{data.exam_id.replace("_", " ").toUpperCase()}</h1>
      <p className="text-sm text-gray-500 mb-6">Level: {data.level} · Source: {data.source}</p>

      {Object.entries(grouped).map(([group, sections]) => (
        <div key={group} className="mb-8">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">{group}</h2>
          <div className="space-y-2">
            {sections.map(s => {
              const score = getSectionScore(s.key)
              return (
                <Link
                  key={s.key}
                  href={`/exam/${examId}/${s.key}`}
                  className="flex items-center gap-3 p-4 rounded-xl border bg-white hover:border-blue-300 hover:shadow-sm transition-all"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{s.label}</div>
                    <div className="text-xs text-gray-500">{s.totalQuestions} questions</div>
                  </div>
                  {score.total > 0 && (
                    <div className="text-sm font-medium text-blue-600">
                      {score.correct}/{score.total}
                    </div>
                  )}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-300 shrink-0">
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
```

- [ ] **Step 5: Write exercise router page**

Write `src/app/exam/[examId]/[sectionKey]/page.tsx`:

```tsx
"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { useExamData } from "@/hooks/useExamData"
import { resolveSectionData } from "@/lib/exam"
import type { SectionKey, LeseverstehenTeil1, LeseverstehenTeil2, LeseverstehenTeil3, SprachbausteineTeil1, SprachbausteineTeil2, HoerverstehenTeil, SchreibenSection } from "@/types/exam"
import { sectionLabel } from "@/lib/exam"

import HeadlineMatching from "@/components/exercises/HeadlineMatching"
import TextMCQ from "@/components/exercises/TextMCQ"
import SituationAdMatch from "@/components/exercises/SituationAdMatch"
import GapFillChoices from "@/components/exercises/GapFillChoices"
import GapFillWordBank from "@/components/exercises/GapFillWordBank"
import TrueFalseAudio from "@/components/exercises/TrueFalseAudio"
import WritingPrompt from "@/components/exercises/WritingPrompt"

const audioSrc = (id: string, key: string) => {
  const teilNum = key.split("-")[1]
  return `/audio/${id}_hoer${teilNum}.mp3`
}

export default function ExercisePage() {
  const params = useParams()
  const examId = params.examId as string
  const sectionKey = params.sectionKey as SectionKey
  const { data, loading, error } = useExamData(examId)

  if (loading) return <p className="text-gray-500 text-sm">Loading...</p>
  if (error) return <p className="text-red-500 text-sm">{error}</p>
  if (!data) return null

  const sectionData = resolveSectionData(data, sectionKey)
  const label = sectionLabel(sectionKey)

  return (
    <div className="max-w-4xl">
      <Link href={`/exam/${examId}`} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        Back to exam
      </Link>

      <h1 className="text-xl font-bold mb-6">{label}</h1>

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
          audioSrc={audioSrc(examId, sectionKey)}
        />
      )}
      {sectionKey === "schreiben" && <WritingPrompt data={sectionData as SchreibenSection} examId={examId} sectionKey={sectionKey} />}
    </div>
  )
}
```

---

### Task 13: Vocab Review Page

**Files:**
- Create: `src/app/vocab/page.tsx`

- [ ] **Step 1: Write the vocab page**

Write `src/app/vocab/page.tsx`:

```tsx
"use client"

import { useState, useMemo } from "react"
import { useLocalStorage } from "@/hooks/useLocalStorage"
import type { DictionaryEntry } from "@/lib/dictionary"

export default function VocabPage() {
  const [savedWords, setSavedWords] = useLocalStorage<string[]>("saved_vocab", [])
  const [wordEntries, setWordEntries] = useLocalStorage<Record<string, DictionaryEntry>>("vocab_entries", {})
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<string>("All")
  const [flashcard, setFlashcard] = useState(false)
  const [cardIndex, setCardIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)

  const entries = useMemo(() => {
    return savedWords
      .map(w => wordEntries[w])
      .filter((e): e is DictionaryEntry => !!e)
  }, [savedWords, wordEntries])

  const filtered = useMemo(() => {
    return entries.filter(e => {
      if (search && !e.word.toLowerCase().includes(search.toLowerCase()) &&
          !e.english_translations.some(t => t.toLowerCase().includes(search.toLowerCase()))) return false
      if (filter !== "All" && e.part_of_speech !== filter.toLowerCase()) return false
      return true
    })
  }, [entries, search, filter])

  const removeWord = (word: string) => {
    setSavedWords(prev => prev.filter(w => w !== word))
    setWordEntries(prev => {
      const next = { ...prev }
      delete next[word]
      return next
    })
  }

  const parts = ["All", "Noun", "Verb", "Adjective"]

  if (flashcard && filtered.length > 0) {
    const current = filtered[cardIndex % filtered.length]
    return (
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold">Flashcard Drill</h1>
          <button onClick={() => { setFlashcard(false); setRevealed(false) }} className="text-sm text-gray-500 hover:text-gray-700">
            Back to list
          </button>
        </div>
        <div
          onClick={() => setRevealed(true)}
          className="border-2 rounded-2xl p-12 text-center cursor-pointer hover:border-blue-300 transition-colors bg-white min-h-[300px] flex flex-col items-center justify-center"
        >
          <div className="text-3xl font-bold mb-4">{current.word}</div>
          {current.ipa && <div className="text-sm text-gray-400 mb-2">{current.ipa}</div>}
          {current.article && <div className="text-sm text-gray-500 mb-2">{current.article}</div>}
          <div className="text-xs text-gray-400 uppercase tracking-wide mb-4">{current.part_of_speech}</div>
          {revealed && (
            <div className="space-y-3 mt-4 pt-4 border-t w-full">
              <div className="text-xl">{current.english_translations.join(" · ")}</div>
              {current.german_definition && <div className="text-sm text-gray-600">{current.german_definition}</div>}
              {current.examples.length > 0 && (
                <div className="text-sm text-left">
                  <p className="text-gray-800">{current.examples[0].de}</p>
                  <p className="text-gray-500 text-xs">{current.examples[0].en}</p>
                </div>
              )}
            </div>
          )}
          {!revealed && <p className="text-sm text-gray-400 mt-4">Click to reveal</p>}
        </div>
        <div className="flex justify-between mt-6">
          <button
            onClick={() => { setCardIndex(i => Math.max(0, i - 1)); setRevealed(false) }}
            disabled={cardIndex === 0}
            className="px-4 py-2 border rounded-lg text-sm disabled:opacity-30"
          >
            ← Previous
          </button>
          <span className="text-sm text-gray-500 self-center">{cardIndex + 1} / {filtered.length}</span>
          <button
            onClick={() => { setCardIndex(i => Math.min(filtered.length - 1, i + 1)); setRevealed(false) }}
            disabled={cardIndex >= filtered.length - 1}
            className="px-4 py-2 border rounded-lg text-sm disabled:opacity-30"
          >
            Next →
          </button>
        </div>
        <p className="text-center text-xs text-gray-400 mt-4">Click card to reveal translation</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">My Vocab</h1>
          <p className="text-sm text-gray-500">{entries.length} words saved</p>
        </div>
        {entries.length > 0 && (
          <button onClick={() => setFlashcard(true)} className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600">
            Flashcard drill
          </button>
        )}
      </div>

      <div className="relative mb-4">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Search words..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        {parts.map(p => (
          <button
            key={p}
            onClick={() => setFilter(p)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              filter === p ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400 text-sm">
          {entries.length === 0 ? "No saved words yet. Click any German word in an exercise to save it." : "No words match your search."}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(e => (
            <div key={e.word} className="flex items-center gap-3 p-3 rounded-xl border bg-white">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{e.word}</span>
                  <span className="text-xs text-gray-400">{e.part_of_speech}</span>
                </div>
                <div className="text-sm text-gray-600 truncate">{e.english_translations.join(", ")}</div>
              </div>
              <button onClick={() => removeWord(e.word)} className="text-gray-300 hover:text-red-500 transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6"/><path d="M16 6l-.286-1.717A1.118 1.118 0 0 0 14.638 3H9.362a1.118 1.118 0 0 0-1.076.783L8 6"/>
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

---

### Task 14: Notes Review Page

**Files:**
- Create: `src/app/notes/page.tsx`

- [ ] **Step 1: Write notes page**

Write `src/app/notes/page.tsx`:

```tsx
"use client"

import { useState, useEffect } from "react"

interface NoteEntry {
  key: string
  content: string
  examId: string
  sectionKey: string
  questionId?: number
}

export default function NotesPage() {
  const [notes, setNotes] = useState<NoteEntry[]>([])

  useEffect(() => {
    const entries: NoteEntry[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (!key || !key.startsWith("notes_")) continue
      try {
        const content = localStorage.getItem(key) || ""
        if (!content || content === '""') continue
        const parts = key.split("_")
        const entry: NoteEntry = {
          key,
          content: JSON.parse(content),
          examId: parts[1],
          sectionKey: parts[2],
          questionId: parts[3] ? Number(parts[3]) : undefined,
        }
        if (entry.content) entries.push(entry)
      } catch {}
    }
    setNotes(entries)
  }, [])

  const deleteNote = (key: string) => {
    localStorage.removeItem(key)
    setNotes(prev => prev.filter(n => n.key !== key))
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-1">My Notes</h1>
      <p className="text-sm text-gray-500 mb-6">{notes.length} notes saved</p>

      {notes.length === 0 ? (
        <div className="text-center py-12 text-gray-400 text-sm">
          No notes yet. Use the notes area in any exercise to save notes.
        </div>
      ) : (
        <div className="space-y-3">
          {notes.map(n => (
            <div key={n.key} className="border rounded-xl p-4 bg-white">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="text-xs text-gray-400 uppercase tracking-wide font-medium">
                  {n.examId} · {n.sectionKey}{n.questionId ? ` · Q${n.questionId}` : ""}
                </div>
                <button onClick={() => deleteNote(n.key)} className="text-gray-300 hover:text-red-500 shrink-0">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
              <p className="text-sm whitespace-pre-wrap">{n.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

---

### Task 15: Wire up data serving

**Files:**
- Modify: `next.config.js`

- [ ] **Step 1: Create API route for serving exam JSON**

Create `src/app/api/data/[examId]/route.ts`:

```ts
import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function GET(_req: Request, { params }: { params: { examId: string } }) {
  const filePath = path.join(process.cwd(), "data", `${params.examId}.json`)
  try {
    const content = fs.readFileSync(filePath, "utf-8")
    return new NextResponse(content, {
      headers: { "Content-Type": "application/json" },
    })
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }
}
```

---

## Spec Coverage Check

| Spec Requirement | Task |
|---|---|
| Home page with exam cards | Task 12 (Step 3) |
| Exam page with section listing | Task 12 (Step 4) |
| Floating dictionary (drawer, click words) | Task 3 |
| Dictionary API client + cache | Task 3 (Step 1) |
| Saved vocabulary | Task 3 (Drawer save button) + Task 13 |
| Notes textarea per section/question | Task 5 (NotesTextarea) + Task 14 |
| Lesen 1 — headline matching | Task 6 |
| Lesen 2 — text + MCQ | Task 7 |
| Lesen 3 — situation-ad matching | Task 8 |
| Sprach 1 — gap fill with grammar explanations | Task 9 (Step 1) |
| Sprach 2 — gap fill word bank | Task 9 (Step 2) |
| Hören — audio + true/false | Task 10 |
| Schreiben — writing prompt with checklist | Task 11 |
| Vocab review (list + flashcard drill) | Task 13 |
| Notes review page | Task 14 |
| Sidebar navigation | Task 12 (Step 1) |
| SVG icons (no emoji/images) | All components use inline SVGs |
| Progress tracking (localStorage) | Task 4 (useProgress) |
