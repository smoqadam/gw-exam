# Dexam2 — German B1 Exam Prep App

## Overview

A Next.js SPA for studying German B1 vocabulary and practicing mock exam exercises. The primary goal is vocabulary acquisition through contextual reading with an instant dictionary, with exam exercises as a secondary layer.

## Data

Exam data lives in JSON files under `data/`. Currently one exam (`exam_01.json`) with these sections:

- **Leseverstehen** (Lesen 1–3): headline-matching, text+MCQ, situation-ad-matching
- **Sprachbausteine** (Sprach 1–2): gap-fill with 3 choices, gap-fill from word bank
- **Hörverstehen** (Hören 1–3): true/false with pre-generated MP3 audio
- **Schreiben**: writing prompt with required points rubric

Generated audio files live in `public/audio/`.

## Page Structure

```
Home (list of exams)
├── Exam page (list of sections with progress)
│   ├── Leseverstehen Teil 1 — headline matching
│   ├── Leseverstehen Teil 2 — text + MCQs
│   ├── Leseverstehen Teil 3 — situation-ad matching
│   ├── Sprachbausteine Teil 1 — gap fill (3 choices)
│   ├── Sprachbausteine Teil 2 — gap fill (word bank)
│   ├── Hörverstehen Teil 1–3 — audio + true/false
│   └── Schreiben — writing prompt
├── My Vocab (saved words: list + flashcard drill)
└── My Notes (all saved notes per section/question)
```

## Tech Stack

- **Framework:** Next.js (App Router, client-side SPA)
- **Styling:** Tailwind CSS
- **Dictionary API:** `https://dict.germanweekly.com/api/lookup/{word}`
- **Audio:** Static MP3 files generated via scripts (not in-browser synthesis)
- **Persistence:** localStorage (progress, saved vocabulary, notes)

## Core Features

### Global Floating Dictionary

A persistent dictionary drawer accessible from any page:

- **Closed state:** Small book icon button fixed at bottom-right of viewport
- **Open state:** A right-side drawer (320px wide) that slides in. Page content dims behind it.
- **Trigger methods:**
  - Click any German word in the app → opens drawer with that word pre-loaded
  - Type a word manually into the drawer's search input
- **Dictionary display:** Shows word, IPA, part of speech, English translations, German definition, grammar notes, lemma, examples, related words
- **Save button:** Adds the word to the user's saved vocabulary (localStorage)
- **Dismiss:** Close button or click outside the drawer

### Exercise Pages

Each section type has a tailored layout, but all share:

1. **Source material display** — the text(s), ad list, letter, or script for that section. All German words are clickable → dictionary lookup.
2. **Interactive quiz** — matches the exam format (matching, MCQ, gap-fill, true/false, or writing)
3. **Notes textarea** — placement varies by section type (see per-section details below). Saved as `examId_sectionId_questionId` in localStorage. Reviewable from the My Notes page.

#### Leseverstehen Teil 1 (Headline Matching)

- Left column: list of 10 headlines (a–j)
- Right column: 5 texts with "select headline" buttons below each
- User clicks a headline letter to assign it to a text
- "Check answers" highlights correct matches green, wrong red
- Notes textarea below the texts

#### Leseverstehen Teil 2 (Text + MCQ)

- Scrollable reading text at top (collapsible/expandable)
- 5 multiple-choice questions below, 3 options each
- After answering: correct answer highlighted green with relevant text context shown
- Notes per question

#### Leseverstehen Teil 3 (Situation-Ad Matching)

- Left: 10 situations listed vertically
- Right: dropdown select for each situation to pick an ad (a–l)
- Selecting an ad shows a preview of that ad below the dropdown
- Notes area below situations

#### Sprachbausteine Teil 1 (Gap Fill — 3 Choices)

- The full letter displayed with gap buttons inline (`[21]`, `[22]`, etc.)
- Clicking a gap opens the 3 choice options below
- After selecting a choice, instant feedback shows:
  - Correct/incorrect indicator
  - The correct answer highlighted
  - Grammar explanation from the `grammar_point` field
- Notes per question

#### Sprachbausteine Teil 2 (Gap Fill — Word Bank)

- Same gap-fill mechanic but with a shuffled word bank of ~15 words
- User picks from the bank and assigns to each gap
- No grammar explanations (not in the data)
- Notes area

#### Hörverstehen (True/False)

- Audio player with the pre-generated MP3 for that Teil
- List of statements with Richtig/Falsch toggle buttons
- User listens and marks each statement
- Notes textarea for taking notes while listening

#### Schreiben (Writing)

- Shows the incoming letter in a styled box
- Checklist of required points (with checkbox to self-mark)
- Large textarea for writing the response
- Word count tracker (min 100 words)
- Save draft button

## Sidebar Navigation

- **Exams** — back to exam listing
- **My Vocab** — see all saved words with dictionary data, filter by part of speech or exam section, delete words
- **My Notes** — all saved notes grouped by exam/section/question

## Saved Vocabulary Page

- Search/filter input at top
- Part-of-speech filter pills (All, Noun, Verb, Adjective)
- Word list showing: word, English translation, part of speech, source section
- Delete button per word
- "Practice saved words" section:
  - Simple flashcard mode: show German word → user recalls → click to reveal English
  - Track which words are "learning" vs "known" (optional enhancement)

## Progress Tracking

- Per section: number of correct answers out of total
- Per question: store whether answered correctly
- Wrong-answer review mode (optional phase 2 feature)

## Phasing

### Phase 1 (current scope)
- All page layouts and exercise types implemented
- Floating dictionary with word click
- Saved vocabulary
- Notes per section/question
- Progress tracking (localStorage)

### Phase 2 (future, out of scope)
- Exam simulation mode with timer
- Spaced repetition for vocabulary
- More exams added to `data/`
- Wrong-answer review mode
- Writing submission self-evaluation rubric

## Notes on Implementation

- All German text in the app must be rendered with clickable words. Implementation: wrap each word in a `<span>` with `onClick` that opens the dictionary. 
- Dictionary lookups should be cached in localStorage to avoid redundant API calls.
- The floating dictionary should be a single shared React context or component mounted at the layout level.
- Audio files are pre-generated; the player is a simple HTML5 `<audio>` element with minimal custom styling.
- Notes are stored as JSON under a key like `notes:{examId}:{sectionId}:{questionId}`.
- Saved vocabulary stored as `vocab` array in localStorage, deduplicated by word.
