#!/usr/bin/env python3
"""
Extract structured exam content from a TELC B1 German exam PDF.

Uses OpenAI vision (gpt-4o) to read all pages as images and return
a complete exam JSON matching the B1 Trainer schema.

Usage:
    python scripts/extract.py pdfs/1.pdf
"""

import os
import sys
import json
import base64
import io
import re
from pathlib import Path
from dotenv import load_dotenv
import pdfplumber
from openai import OpenAI

load_dotenv()

OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    print("Error: OPENAI_API_KEY not set in .env", file=sys.stderr)
    sys.exit(1)

client = OpenAI(api_key=OPENAI_API_KEY)

ROOT = Path(__file__).resolve().parent.parent
EXAMS_DIR = ROOT / "exams" / "pdf"

EXTRACTION_PROMPT = """You are extracting structured exam content from a TELC B1 German exam PDF.

You are given every page of the exam as an image. Your task is to return the complete exam content as a JSON object matching the exact schema below.

## Critical rules

1. Return ONLY valid JSON — no markdown fences, no commentary, nothing outside the JSON braces.
2. Preserve the EXACT German text from the PDF. Do not correct, paraphrase, or translate anything.
3. The PDF includes an answer key (Lösungen) page — use it to fill in ALL answer fields.
4. For Hörverstehen: mark audio_status as "needs_generation" and set generated_script to null.
5. Use the standard TELC B1 question numbering:
   - Leseverstehen Teil 1: 1-5
   - Leseverstehen Teil 2: 6-10
   - Leseverstehen Teil 3: 11-20
   - Sprachbausteine Teil 1: 21-30
   - Sprachbausteine Teil 2: 31-40
   - Hörverstehen Teil 1: 41-45
   - Hörverstehen Teil 2: 46-55
   - Hörverstehen Teil 3: 56-60

## JSON Schema

{
  "exam_id": "exam_NN",
  "source": "pdf",
  "level": "B1",
  "sections": {
    "leseverstehen": {
      "teil1": {
        "headlines": [
          {"id": "a", "text": "..."}
        ],
        "texts": [
          {"id": 1, "content": "full text..."}
        ],
        "answers": {
          "1": "d"
        }
      },
      "teil2": {
        "title": "...",
        "content": "full article text...",
        "questions": [
          {
            "id": 6,
            "stem": "...",
            "options": {"a": "...", "b": "...", "c": "..."},
            "answer": "c"
          }
        ]
      },
      "teil3": {
        "situations": [
          {"id": 11, "text": "..."}
        ],
        "ads": [
          {"id": "a", "title": "...", "content": "..."}
        ],
        "answers": {
          "11": "e"
        }
      }
    },
    "sprachbausteine": {
      "teil1": {
        "context": "short description of text type and topic",
        "text_with_gaps": "full text with [21]...[30] gap markers",
        "questions": [
          {
            "id": 21,
            "options": {"a": "...", "b": "...", "c": "..."},
            "answer": "b",
            "grammar_point": "brief grammar explanation in English"
          }
        ]
      },
      "teil2": {
        "context": "short description of text type and topic",
        "text_with_gaps": "full text with [31]...[40] gap markers",
        "word_bank": {
          "a": "WORT"
        },
        "answers": {
          "31": "o"
        }
      }
    },
    "hoerverstehen": {
      "teil1": {
        "topic": "short topic description",
        "play_count": 1,
        "format": "monologues",
        "audio_file": "exam_NN_hoer1.mp3",
        "audio_status": "needs_generation",
        "generated_script": null,
        "speakers": ["Herr ...", "Frau ..."],
        "statements": [
          {"id": 41, "text": "...", "answer": true}
        ]
      },
      "teil2": {
        "topic": "short topic description",
        "play_count": 2,
        "format": "interview",
        "audio_file": "exam_NN_hoer2.mp3",
        "audio_status": "needs_generation",
        "generated_script": null,
        "speakers": [
          {"role": "interviewer", "name": "Moderatorin", "voice": "nova"},
          {"role": "guest", "name": "Herr ...", "voice": "onyx"}
        ],
        "statements": [
          {"id": 46, "text": "...", "answer": true}
        ]
      },
      "teil3": {
        "topic": "short topic description",
        "play_count": 2,
        "format": "announcements",
        "audio_file": "exam_NN_hoer3.mp3",
        "audio_status": "needs_generation",
        "generated_script": null,
        "statements": [
          {"id": 56, "text": "...", "answer": false}
        ]
      }
    },
    "schreiben": {
      "type": "letter_response",
      "incoming_letter": {
        "sender": "Name of sender",
        "content": "full letter text..."
      },
      "required_points": [
        "point 1",
        "point 2",
        "point 3",
        "point 4"
      ],
      "instructions": "any additional instructions from the exam",
      "min_words": 100,
      "rating_criteria": {
        "content": "All 4 required points addressed clearly and relevantly",
        "communicative_design": "Appropriate letter format with greeting, intro, body, and closing",
        "vocabulary": "Range and appropriateness for B1 level",
        "grammar": "Accuracy of structures — subordinate clauses, tenses, adjective endings"
      }
    }
  }
}

## Per-section extraction instructions

### Leseverstehen Teil 1 (Matching headlines to texts)
- Extract exactly 10 headlines (a-j) and 5 texts (1-5).
- The answer key maps each text number to a headline letter.

### Leseverstehen Teil 2 (Multiple choice on a longer text)
- Extract the full article text including title.
- Extract 5 questions (6-10), each with exactly 3 options (a/b/c).
- The answer key gives the correct letter for each.

### Leseverstehen Teil 3 (Matching situations to ads)
- Extract exactly 10 situation descriptions (11-20).
- Extract ALL advertisements from the ad pages. Each ad has a letter label (a, b, c, ...), a title, and content text.
- CRITICAL: the ad pages are visually complex with multi-column layouts, boxes, and varied typography. Read every ad carefully and extract its full content.
- The answer key maps each situation to an ad letter, or "x" when no ad matches that situation.

### Sprachbausteine Teil 1 (Grammar gaps)
- Extract the full letter/text with gap positions marked as [21] through [30] inline.
- Each gap has 3 options (a/b/c).
- Add a brief grammar_point note for each gap (e.g., "preposition with dative", "subordinating conjunction — verb-final word order").

### Sprachbausteine Teil 2 (Word bank gaps)
- Extract the full text with gap positions marked as [31] through [40] inline.
- Extract exactly 15 words from the word bank (a-o), preserving CAPITALIZATION exactly.
- The answer key maps each gap number to the correct word bank letter.

### Hörverstehen (Listening comprehension)
- Extract topic descriptions and speaker names from the section headers and statement introductions.
- Set audio_status to "needs_generation" and generated_script to null for all teile.
- For Teil 1: extract speaker names if mentioned. Set play_count to 1 (one play in real exam).
- For Teil 2: identify interviewer and guest names if given. Set play_count to 2.
- For Teil 3: set format to "announcements". Set play_count to 2.
- audio_file naming: exam_NN_hoer1.mp3, exam_NN_hoer2.mp3, exam_NN_hoer3.mp3.
- Answers for Hörverstehen use true/false (not letters).

### Schreiben (Writing task)
- Extract the incoming letter completely, including sender name.
- Extract the 4 required bullet points exactly as shown.
- Extract any additional instructions.
- The rating_criteria object is constant — use exactly the object shown in the schema.

## Answer representation

- Leseverstehen Teil 1: answers are letters "a" through "j"
- Leseverstehen Teil 2: answers are letters "a", "b", or "c"
- Leseverstehen Teil 3: answers are letters "a" through "l", or "x" for no match
- Sprachbausteine Teil 1: answers are letters "a", "b", or "c"
- Sprachbausteine Teil 2: answers are letters "a" through "o"
- Hörverstehen (all teile): answers are boolean (true/false)

The answer key page (typically the last page) uses columns. The column headers name each section. Below each header, the answer lines show: question-number answer-lettter. For Hörverstehen, answers are shown as + (true) and - (false).

IMPORTANT: Return ONLY the JSON object. No markdown fences, no explanation, no commentary."""


def pdf_to_images(pdf_path):
    """Convert PDF pages to base64-encoded PNG images."""
    images = []
    with pdfplumber.open(pdf_path) as pdf:
        for i, page in enumerate(pdf.pages):
            img = page.to_image(resolution=200)
            buf = io.BytesIO()
            img.save(buf, format="PNG")
            b64 = base64.b64encode(buf.getvalue()).decode()
            images.append({"page": i + 1, "image": b64})
    return images


def build_messages(images, exam_id):
    """Build the OpenAI vision API messages with all page images."""
    prompt = EXTRACTION_PROMPT.replace("exam_NN", exam_id)

    content = [{"type": "text", "text": prompt}]
    for img in images:
        content.append({
            "type": "image_url",
            "image_url": {
                "url": f"data:image/png;base64,{img['image']}",
                "detail": "high"
            }
        })

    return [{"role": "user", "content": content}]


def validate_exam(data):
    """Validate the exam JSON structure. Returns list of error messages."""
    errors = []

    for key in ["exam_id", "source", "level", "sections"]:
        if key not in data:
            errors.append(f"Missing top-level key: {key}")

    if "sections" not in data:
        return errors

    sec = data["sections"]
    for section in ["leseverstehen", "sprachbausteine", "hoerverstehen", "schreiben"]:
        if section not in sec:
            errors.append(f"Missing section: {section}")

    lv = sec.get("leseverstehen", {})
    for teil in ["teil1", "teil2", "teil3"]:
        if teil not in lv:
            errors.append(f"Missing leseverstehen.{teil}")

    t1 = lv.get("teil1", {})
    if len(t1.get("headlines", [])) != 10:
        errors.append(f"leseverstehen.teil1: expected 10 headlines, got {len(t1.get('headlines', []))}")
    if len(t1.get("texts", [])) != 5:
        errors.append(f"leseverstehen.teil1: expected 5 texts, got {len(t1.get('texts', []))}")
    if len(t1.get("answers", {})) != 5:
        errors.append(f"leseverstehen.teil1: expected 5 answers, got {len(t1.get('answers', {}))}")

    t2 = lv.get("teil2", {})
    if len(t2.get("questions", [])) != 5:
        errors.append(f"leseverstehen.teil2: expected 5 questions, got {len(t2.get('questions', []))}")

    t3 = lv.get("teil3", {})
    if len(t3.get("situations", [])) != 10:
        errors.append(f"leseverstehen.teil3: expected 10 situations, got {len(t3.get('situations', []))}")
    if len(t3.get("answers", {})) != 10:
        errors.append(f"leseverstehen.teil3: expected 10 answers, got {len(t3.get('answers', {}))}")

    sb = sec.get("sprachbausteine", {})
    if "teil1" in sb:
        if len(sb["teil1"].get("questions", [])) != 10:
            errors.append(f"sprachbausteine.teil1: expected 10 questions, got {len(sb['teil1'].get('questions', []))}")
    if "teil2" in sb:
        if len(sb["teil2"].get("answers", {})) != 10:
            errors.append(f"sprachbausteine.teil2: expected 10 answers, got {len(sb['teil2'].get('answers', {}))}")
        if len(sb["teil2"].get("word_bank", {})) != 15:
            errors.append(f"sprachbausteine.teil2: expected 15 word_bank entries, got {len(sb['teil2'].get('word_bank', {}))}")

    hv = sec.get("hoerverstehen", {})
    if "teil1" in hv:
        if len(hv["teil1"].get("statements", [])) != 5:
            errors.append(f"hoerverstehen.teil1: expected 5 statements")
    if "teil2" in hv:
        if len(hv["teil2"].get("statements", [])) != 10:
            errors.append(f"hoerverstehen.teil2: expected 10 statements")
    if "teil3" in hv:
        if len(hv["teil3"].get("statements", [])) != 5:
            errors.append(f"hoerverstehen.teil3: expected 5 statements")

    sch = sec.get("schreiben", {})
    if len(sch.get("required_points", [])) != 4:
        errors.append(f"schreiben: expected 4 required_points, got {len(sch.get('required_points', []))}")

    return errors


def clean_json(raw):
    """Strip markdown fences from model response."""
    text = raw.strip()
    if text.startswith("```"):
        parts = text.split("```")
        if len(parts) >= 2:
            text = parts[1]
            if text.startswith("json"):
                text = text[4:]
    return text.strip()


def extract(pdf_path):
    """Main extraction pipeline. Returns the parsed exam dict."""
    pdf_path = Path(pdf_path)
    if not pdf_path.exists():
        print(f"Error: file not found: {pdf_path}", file=sys.stderr)
        sys.exit(1)

    stem = pdf_path.stem
    num_match = re.search(r"(\d+)", stem)
    exam_id = f"exam_{num_match.group(1).zfill(2)}" if num_match else stem

    print(f"Extracting: {pdf_path.name} → {exam_id}")

    print("  Rendering pages...")
    images = pdf_to_images(str(pdf_path))
    print(f"  {len(images)} pages rendered")

    print("  Sending to vision API (gpt-4o)...")
    messages = build_messages(images, exam_id)

    response = client.chat.completions.create(
        model="gpt-4o",
        messages=messages,
        max_tokens=16000,
    )

    raw = response.choices[0].message.content
    print(f"  Response received: {len(raw)} chars")

    cleaned = clean_json(raw)
    try:
        data = json.loads(cleaned)
    except json.JSONDecodeError as e:
        debug_path = EXAMS_DIR / f"{exam_id}_raw.txt"
        EXAMS_DIR.mkdir(parents=True, exist_ok=True)
        with open(debug_path, "w") as f:
            f.write(raw)
        print(f"  JSON parse error: {e}", file=sys.stderr)
        print(f"  Raw response saved to {debug_path}", file=sys.stderr)
        sys.exit(1)

    errors = validate_exam(data)
    if errors:
        print(f"  Validation found {len(errors)} issues, retrying with feedback...")
        messages.append({"role": "assistant", "content": raw})
        messages.append({
            "role": "user",
            "content": f"Your previous response had these validation errors:\n\n" +
                       "\n".join(f"- {e}" for e in errors) +
                       "\n\nFix all issues and return the complete corrected JSON. Return ONLY valid JSON."
        })

        response2 = client.chat.completions.create(
            model="gpt-4o",
            messages=messages,
            max_tokens=16000,
        )
        raw2 = response2.choices[0].message.content
        cleaned2 = clean_json(raw2)
        try:
            data = json.loads(cleaned2)
            errors = validate_exam(data)
        except json.JSONDecodeError:
            pass

    if errors:
        print(f"  Validation still has {len(errors)} errors:", file=sys.stderr)
        for e in errors:
            print(f"    - {e}", file=sys.stderr)
        debug_path = EXAMS_DIR / f"{exam_id}_raw.txt"
        EXAMS_DIR.mkdir(parents=True, exist_ok=True)
        with open(debug_path, "w") as f:
            f.write(raw)
        print(f"  Raw response saved to {debug_path}", file=sys.stderr)
        sys.exit(1)

    EXAMS_DIR.mkdir(parents=True, exist_ok=True)
    out_path = EXAMS_DIR / f"{exam_id}.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"  Saved: {out_path}")
    return data


def main():
    if len(sys.argv) != 2:
        print(f"Usage: {sys.argv[0]} <pdf_path>", file=sys.stderr)
        print(f"Example: {sys.argv[0]} pdfs/1.pdf", file=sys.stderr)
        sys.exit(1)
    extract(sys.argv[1])


if __name__ == "__main__":
    main()
