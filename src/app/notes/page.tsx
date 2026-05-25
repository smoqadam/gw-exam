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
      <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: "var(--font-serif, serif)" }}>My Notes</h1>
      <p className="text-sm text-text-secondary mb-6">{notes.length} notes saved</p>

      {notes.length === 0 ? (
        <div className="text-center py-12 text-text-secondary text-sm">
          No notes yet. Use the notes area in any exercise to save notes.
        </div>
      ) : (
        <div className="space-y-3">
          {notes.map(n => (
            <div key={n.key} className="border border-border rounded-xl p-4 bg-surface">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="text-xs text-text-secondary uppercase tracking-wider font-medium">
                  {n.examId} · {n.sectionKey}{n.questionId ? ` · Q${n.questionId}` : ""}
                </div>
                <button onClick={() => deleteNote(n.key)} className="text-border hover:text-error shrink-0">
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
