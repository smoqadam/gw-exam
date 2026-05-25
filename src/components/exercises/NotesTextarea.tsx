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
    <div className="relative mt-3">
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
