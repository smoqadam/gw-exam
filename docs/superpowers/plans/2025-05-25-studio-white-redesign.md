# Studio White Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign Dexam2 with warm off-white background, near-black text, terracotta accent, DM Serif Display headings + DM Sans body.

**Architecture:** CSS custom properties + Tailwind v4 `@theme` tokens define all colors. Each component replaces hardcoded blue/gray classes with semantic token classes. No structural changes.

**Tech Stack:** Next.js 16, Tailwind CSS v4, TypeScript, next/font/google

---

### Task 1: Design tokens + font imports

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Write globals.css with theme and base styles**

```css
@import "tailwindcss";

@theme {
  --color-bg-main: #F5F5F0;
  --color-surface: #FFFFFF;
  --color-border: #ECE8E0;
  --color-text-primary: #2D3436;
  --color-text-secondary: #8A877E;
  --color-accent: #E17055;
  --color-accent-hover: #D46045;
  --color-accent-subtle: #FDF6F3;
  --color-success: #2D8A4E;
  --color-success-subtle: #EDF7F0;
  --color-error: #C44536;
  --color-error-subtle: #FDF2F0;
  --color-nav-bg: #2D3436;
  --color-nav-text: #6B685F;
}

@layer base {
  body {
    background-color: #F5F5F0;
    color: #2D3436;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
}
```

- [ ] **Step 2: Update layout.tsx fonts**

Edit `src/app/layout.tsx`:

Replace:
```tsx
import { Inter } from "next/font/google"
import "./globals.css"
import ClientLayout from "./client-layout"

const inter = Inter({ subsets: ["latin"] })

// ...

<html lang="de">
  <body className={`${inter.className} bg-gray-50`}>
    <ClientLayout>{children}</ClientLayout>
  </body>
</html>
```

With:
```tsx
import { DM_Sans, DM_Serif_Display } from "next/font/google"
import "./globals.css"
import ClientLayout from "./client-layout"

const dmSans = DM_Sans({ subsets: ["latin"], weight: ["400", "500", "600"] })
const dmSerifDisplay = DM_Serif_Display({ subsets: ["latin"], weight: "400", variable: "--font-serif" })

// ...

<html lang="de">
  <body className={dmSans.className}>
    <ClientLayout>{children}</ClientLayout>
  </body>
</html>
```

- [ ] **Step 3: Run dev server and verify no build errors**

Run: `npm run dev` (check for compilation errors)
Expected: App loads without font/compilation errors

- [ ] **Step 4: Commit**

```bash
git add src/app/globals.css src/app/layout.tsx
git commit -m "feat: add Studio White design tokens and font imports"
```

---

### Task 2: Client layout + sidebar

**Files:**
- Modify: `src/app/client-layout.tsx`
- Modify: `src/components/layout/Sidebar.tsx`

- [ ] **Step 1: Update client-layout.tsx spacing**

Edit `src/app/client-layout.tsx`:

Replace:
```tsx
<div className="flex h-screen">
  <Sidebar />
  <main className="flex-1 overflow-y-auto p-6 lg:p-8">
    {children}
  </main>
</div>
```

With:
```tsx
<div className="flex h-screen bg-bg-main">
  <Sidebar />
  <main className="flex-1 overflow-y-auto p-8 lg:p-10">
    {children}
  </main>
</div>
```

- [ ] **Step 2: Rewrite Sidebar.tsx**

Write entire file `src/components/layout/Sidebar.tsx`:

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
    <aside className="w-52 border-r border-border bg-surface flex flex-col shrink-0">
      <div className="px-3 py-4 border-b border-border">
        <Link href="/" className="flex items-center gap-2 font-semibold text-text-primary">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
          </svg>
          <span style={{ fontFamily: "var(--font-serif, serif)" }}>Dexam</span>
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
                  ? "bg-nav-bg text-white font-medium"
                  : "text-nav-text hover:bg-bg-main"
              }`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
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

- [ ] **Step 3: Commit**

```bash
git add src/app/client-layout.tsx src/components/layout/Sidebar.tsx
git commit -m "feat: update layout spacing and sidebar styling"
```

---

### Task 3: Homepage exam cards

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Update homepage with new card styling**

Edit `src/app/page.tsx`:

Replace the tailwind classes in the JSX:

- Container: `max-w-2xl` stays
- h1: add `style={{ fontFamily: "var(--font-serif, serif)" }}` for serif heading
- `text-gray-500` → `text-text-secondary`
- Card: `block border rounded-xl p-5 hover:border-blue-300 hover:shadow-sm transition-all bg-white` → `block border border-border rounded-xl p-6 hover:shadow-sm transition-all bg-surface`
- Icon div: `w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center text-white` → `w-11 h-11 rounded-[10px] border border-border bg-bg-main flex items-center justify-center text-text-secondary shrink-0`
- Card title: `font-semibold` stay, remove existing color
- Description: `text-sm text-gray-500` → `text-sm text-text-secondary`
- Progress text: `text-xs text-gray-500` → `text-xs text-text-secondary`
- Progress track: `h-2 bg-gray-100` → `h-[5px] bg-border`
- Progress fill: `h-full bg-blue-500` → `h-full bg-accent`
- Chevron: `text-gray-300` → `text-border`

The complete file after changes:

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
      <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: "var(--font-serif, serif)" }}>Exams</h1>
      <p className="text-text-secondary text-sm mb-6">Select an exam to start studying</p>

      <div className="space-y-4">
        {EXAMS.map(exam => {
          const examProgress = progress[exam.id]
          const completed = examProgress ? Object.keys(examProgress as object).length : 0
          const pct = Math.round((completed / exam.sections) * 100)

          return (
            <Link
              key={exam.id}
              href={`/exam/${exam.id}`}
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
```

- [ ] **Step 2: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: update homepage exam cards with new palette"
```

---

### Task 4: Exam detail page

**Files:**
- Modify: `src/app/exam/[examId]/page.tsx`

- [ ] **Step 1: Update exam detail page styling**

Edit `src/app/exam/[examId]/page.tsx` with color replacements:

- Back link: `text-gray-500 hover:text-gray-700` → `text-text-secondary hover:text-text-primary`
- h1: add serif font
- `text-gray-500` → `text-text-secondary`
- `text-gray-500 uppercase tracking-wide` → `text-text-secondary uppercase tracking-wider`
- Section cards: `rounded-xl border bg-white hover:border-blue-300 hover:shadow-sm` → `rounded-xl border border-border bg-surface hover:shadow-sm`
- `text-xs text-gray-500` → `text-xs text-text-secondary`
- `text-sm font-medium text-blue-600` → `text-sm font-medium text-accent`
- `text-gray-300` → `text-border`

Relevant section changes:

```tsx
<h1 className="text-2xl font-bold mb-1" style={{ fontFamily: "var(--font-serif, serif)" }}>
  {data.exam_id.replace("_", " ").toUpperCase()}
</h1>
<p className="text-sm text-text-secondary mb-6">Level: {data.level} · Source: {data.source}</p>
```

```tsx
<h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">{group}</h2>
```

```tsx
<Link
  key={s.key}
  href={`/exam/${examId}/${s.key}`}
  className="flex items-center gap-3 p-4 rounded-xl border border-border bg-surface hover:shadow-sm transition-all"
>
```

```tsx
{score.total > 0 && (
  <div className="text-sm font-medium text-accent">
    {score.correct}/{score.total}
  </div>
)}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/exam/[examId]/page.tsx
git commit -m "feat: update exam detail page with new palette"
```

---

### Task 5: Exercise components (color swap)

**Files:**
- Modify: `src/components/exercises/GapFillChoices.tsx`
- Modify: `src/components/exercises/GapFillWordBank.tsx`
- Modify: `src/components/exercises/TextMCQ.tsx`
- Modify: `src/components/exercises/HeadlineMatching.tsx`
- Modify: `src/components/exercises/SituationAdMatch.tsx`
- Modify: `src/components/exercises/TrueFalseAudio.tsx`
- Modify: `src/components/exercises/WritingPrompt.tsx`
- Modify: `src/components/exercises/NotesTextarea.tsx`
- Modify: `src/app/exam/[examId]/[sectionKey]/page.tsx`

**Pattern for all exercise components:**
- `bg-blue-500` → `bg-accent`
- `hover:bg-blue-600` → `hover:bg-accent-hover`
- `border-blue-500` → `border-accent`
- `bg-blue-50` → `bg-accent-subtle`
- `text-blue-700` → nothing (inherit text-primary) or just remove the blue text class
- `focus:ring-blue-500` → `focus:ring-accent`
- `bg-gray-50` → `bg-bg-main` (surface subtle backgrounds)
- `border-gray-200` → `border-border`
- `hover:border-gray-300` → `hover:border-text-secondary` or keep `hover:border-border`
- `text-gray-400` → `text-text-secondary`
- `text-gray-500` → `text-text-secondary`
- `bg-gray-100` → `bg-bg-main`

Specific changes:

- [ ] **Step 1: Update GapFillChoices.tsx**

Replace all blue colors with accent. Change bg-gray-50 to bg-bg-main. Change border-gray-200 to border-border.

Key changes in the file:
- `"border-blue-500 bg-blue-50 text-blue-700"` → `"border-accent bg-accent-subtle text-accent"`
- Submit button: `bg-blue-500 text-white hover:bg-blue-600` → `bg-accent text-white hover:bg-accent-hover`
- Result box: `bg-green-50 border border-green-200` → `bg-success-subtle border border-success`
- `text-green-700` → `text-success`
- Score box: `bg-gray-50` → `bg-bg-main`

- [ ] **Step 2: Update GapFillWordBank.tsx**

- `"border-blue-500 bg-blue-50 text-blue-700"` → `"border-accent bg-accent-subtle text-accent"`
- `"bg-blue-100 text-blue-700 border border-blue-300"` → `"bg-accent-subtle text-accent border border-accent"`
- `"bg-white border border-gray-200 hover:border-gray-300"` → `"bg-surface border border-border hover:border-text-secondary"`
- `bg-gray-50` → `bg-bg-main`
- Check button: `bg-blue-500 text-white rounded-lg hover:bg-blue-600` → `bg-accent text-white rounded-lg hover:bg-accent-hover`
- Score: `bg-gray-50` → `bg-bg-main`
- Correct/wrong gap colors: keep green/red

- [ ] **Step 3: Update TextMCQ.tsx**

- `"border-gray-200 hover:border-gray-300"` → `"border-border hover:border-text-secondary"`
- `"border-blue-500 bg-blue-50"` → `"border-accent bg-accent-subtle"`
- `hover:bg-gray-50` → `hover:bg-bg-main`
- Check button: `bg-blue-500 text-white hover:bg-blue-600` → `bg-accent text-white hover:bg-accent-hover`
- Score: `bg-gray-50` → `bg-bg-main`

- [ ] **Step 4: Update HeadlineMatching.tsx**

- `"border-gray-200 text-gray-600"` → `"border-border text-text-secondary"`
- `"border-gray-200 hover:border-gray-300 text-gray-600"` → `"border-border hover:border-text-secondary text-text-secondary"`
- `"border-blue-500 bg-blue-50 text-blue-700"` → `"border-accent bg-accent-subtle text-accent"`
- `bg-gray-50` → `bg-bg-main`
- `text-gray-400` → `text-text-secondary`
- Check button: `bg-blue-500 text-white hover:bg-blue-600` → `bg-accent text-white hover:bg-accent-hover`
- Score: `bg-gray-50` → `bg-bg-main`

- [ ] **Step 5: Update SituationAdMatch.tsx**

- `"border-blue-500 bg-blue-50 text-blue-700"` → `"border-accent bg-accent-subtle text-accent"`
- `"border-gray-200 hover:border-gray-300"` → `"border-border hover:border-text-secondary"`
- `"border-gray-200"` → `"border-border"`
- `"text-gray-500"` → `"text-text-secondary"`
- `border-blue-300 bg-blue-50` → `border-accent bg-accent-subtle`
- Check button: `bg-blue-500 text-white hover:bg-blue-600` → `bg-accent text-white hover:bg-accent-hover`
- Score: `bg-gray-50` → `bg-bg-main`

- [ ] **Step 6: Update TrueFalseAudio.tsx**

- `"border-gray-200"` → `"border-border"`
- `"border-blue-500 bg-blue-50 text-blue-700"` → `"border-accent bg-accent-subtle text-accent"`
- `"border-gray-200 text-gray-500 hover:border-gray-300"` → `"border-border text-text-secondary hover:border-text-secondary"`
- `text-gray-500` → `text-text-secondary`
- Check button: `bg-blue-500 text-white hover:bg-blue-600` → `bg-accent text-white hover:bg-accent-hover`
- Score: `bg-gray-50` → `bg-bg-main`

- [ ] **Step 7: Update WritingPrompt.tsx**

- `bg-gray-50` → `bg-bg-main`
- `text-gray-400` → `text-text-secondary`
- `text-gray-500` → `text-text-secondary`
- `"border-gray-200 text-gray-600 hover:border-gray-300"` → `"border-border text-text-secondary hover:border-text-secondary"`
- `focus:ring-blue-500` → `focus:ring-accent`
- `text-gray-400 hover:text-gray-600` → `text-text-secondary hover:text-text-primary`

- [ ] **Step 8: Update NotesTextarea.tsx**

- `text-gray-400` → `text-text-secondary`
- `focus:ring-blue-500` → `focus:ring-accent`
- `border rounded-lg p-3 pl-9 text-sm resize-y focus:outline-none` stays the same, just the ring color changes

- [ ] **Step 9: Update exercise page wrapper**

Edit `src/app/exam/[examId]/[sectionKey]/page.tsx`:

- Back link: `text-gray-500 hover:text-gray-700` → `text-text-secondary hover:text-text-primary`
- h1: add serif font
- Loading text: `text-gray-500` → `text-text-secondary`
- Error text: `text-red-500` → `text-error`

```tsx
<h1 className="text-xl font-bold mb-6" style={{ fontFamily: "var(--font-serif, serif)" }}>{label}</h1>
```

- [ ] **Step 10: Commit**

```bash
git add src/components/exercises/ src/app/exam/
git commit -m "feat: update all exercise components with new palette"
```

---

### Task 6: Audio player

**Files:**
- Modify: `src/components/ui/AudioPlayer.tsx`

- [ ] **Step 1: Rewrite AudioPlayer.tsx**

Edit `src/components/ui/AudioPlayer.tsx`:

Replace:
```tsx
<div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
  <button className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600 transition-colors flex-shrink-0" ...>
  ...
  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
    <div className="h-full bg-blue-500 rounded-full transition-all" .../>
  </div>
  <span className="text-xs text-gray-500 w-16 text-right tabular-nums">...</span>
</div>
```

With:
```tsx
<div className="flex items-center gap-4 p-4 bg-nav-bg rounded-xl">
  <button
    onClick={toggle}
    className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center hover:bg-accent-hover transition-colors flex-shrink-0"
    aria-label={playing ? "Pause" : "Play"}
  >
    ...
  </button>
  <div className="flex-1 h-[4px] bg-white/15 rounded-full overflow-hidden">
    <div className="h-full bg-accent rounded-full transition-all" style={{ width: duration ? `${(currentTime / duration) * 100}%` : "0%" }} />
  </div>
  <span className="text-xs text-white/60 w-20 text-right tabular-nums">
    {Math.floor(currentTime / 60)}:{String(Math.floor(currentTime % 60)).padStart(2, "0")} / {Math.floor(duration / 60)}:{String(Math.floor(duration % 60)).padStart(2, "0")}
  </span>
  <audio .../>
</div>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/AudioPlayer.tsx
git commit -m "feat: redesign audio player with dark bar and accent"
```

---

### Task 7: Vocab page

**Files:**
- Modify: `src/app/vocab/page.tsx`

- [ ] **Step 1: Update vocab page styling**

Edit `src/app/vocab/page.tsx` with color replacements:

- h1: add serif font
- `text-gray-500` → `text-text-secondary`
- Search input: `border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500` → `border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent bg-surface`
- `text-gray-400` → `text-text-secondary`
- Flashcard button: `bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600` → `bg-accent text-white rounded-lg text-sm hover:bg-accent-hover`
- Filter pills active: `bg-blue-500 text-white` → `bg-accent text-white`
- Filter pills inactive: `bg-gray-100 text-gray-600 hover:bg-gray-200` → `bg-bg-main text-text-secondary hover:bg-border`
- Word rows: `rounded-xl border bg-white` → `rounded-xl border border-border bg-surface`
- `text-gray-400` → `text-text-secondary`
- `text-gray-300 hover:text-red-500` → `text-border hover:text-error`
- Flashcard: `border-2 rounded-2xl p-12 text-center cursor-pointer hover:border-blue-300 transition-colors bg-white` → `border-2 border-border rounded-2xl p-12 text-center cursor-pointer hover:border-accent transition-colors bg-surface`
- Flashcard nav buttons: `px-4 py-2 border rounded-lg text-sm` → `px-4 py-2 border border-border rounded-lg text-sm text-text-primary`
- `text-gray-400` → `text-text-secondary`

- [ ] **Step 2: Commit**

```bash
git add src/app/vocab/page.tsx
git commit -m "feat: update vocab page with new palette"
```

---

### Task 8: Notes page

**Files:**
- Modify: `src/app/notes/page.tsx`

- [ ] **Step 1: Update notes page styling**

Edit `src/app/notes/page.tsx`:

- h1: add serif font
- `text-gray-500` → `text-text-secondary`
- `text-gray-400` → `text-text-secondary`
- Note cards: `border rounded-xl p-4 bg-white` → `border border-border rounded-xl p-4 bg-surface`
- `text-gray-400 uppercase tracking-wide font-medium` → `text-text-secondary uppercase tracking-wider font-medium`
- Delete button: `text-gray-300 hover:text-red-500` → `text-border hover:text-error`

- [ ] **Step 2: Commit**

```bash
git add src/app/notes/page.tsx
git commit -m "feat: update notes page with new palette"
```

---

### Task 9: Dictionary components

**Files:**
- Modify: `src/components/dictionary/DictionaryDrawer.tsx`
- Modify: `src/components/dictionary/ClickableWord.tsx`

- [ ] **Step 1: Update DictionaryDrawer.tsx**

Edit `src/components/dictionary/DictionaryDrawer.tsx`:

- Overlay: `bg-black/30` stays
- Drawer panel: `w-80 bg-white shadow-xl flex flex-col border-l` → `w-80 bg-surface shadow-xl flex flex-col border-l border-border`
- `border-b` → `border-b border-border`
- `text-gray-400 hover:text-gray-600` → `text-text-secondary hover:text-text-primary`
- Search input: `border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500` → `border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent bg-surface`
- `text-gray-400` → `text-text-secondary`
- `text-gray-500` → `text-text-secondary`
- `text-red-500` → `text-error`
- `text-gray-500` for metadata → `text-text-secondary`
- `text-gray-400` for lemma → `text-text-secondary`
- Save button: `text-gray-400 border-gray-200 hover:border-blue-300 hover:text-blue-500` → `text-text-secondary border-border hover:border-accent hover:text-accent`
- `text-gray-700` → `text-text-primary`
- `bg-gray-50 p-2 rounded` → `bg-bg-main p-2 rounded`
- `text-gray-600` → `text-text-secondary`
- `bg-gray-100 rounded` → `bg-bg-main rounded`

- [ ] **Step 2: Update ClickableWord.tsx**

Edit `src/components/dictionary/ClickableWord.tsx`:

Replace:
```tsx
className="cursor-pointer hover:text-blue-600 hover:underline decoration-dotted underline-offset-2 transition-colors"
```

With:
```tsx
className="cursor-pointer hover:text-accent hover:underline decoration-dotted underline-offset-2 transition-colors"
```

- [ ] **Step 3: Commit**

```bash
git add src/components/dictionary/
git commit -m "feat: update dictionary components with new palette"
```

---

### Self-Review

**Spec coverage check:**
- ✅ Design tokens (globals.css, layout.tsx) — Task 1
- ✅ Sidebar styling — Task 2
- ✅ Homepage exam cards — Task 3
- ✅ Exam detail section cards — Task 4
- ✅ Exercise components (all types) — Task 5
- ✅ Audio player — Task 6
- ✅ Vocab page — Task 7
- ✅ Notes page — Task 8
- ✅ Dictionary drawer + clickable word — Task 9

**Placeholder check:** No TODOs, TBDs, or incomplete sections.

**Type/color consistency:** All files reference the same token names: `bg-surface`, `border-border`, `text-text-secondary`, `bg-accent`, `bg-accent-subtle`, `text-accent`, `hover:bg-accent-hover`, `bg-bg-main`, `text-text-primary`, `hover:text-text-primary`, `focus:ring-accent`, `text-error`, `text-success`, `bg-success-subtle`, `bg-nav-bg`, `text-nav-text`, `text-white/60`, `bg-white/15`.
