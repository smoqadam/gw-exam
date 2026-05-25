#!/usr/bin/env python3
"""
Generate a new TELC B1 German exam using OpenAI, with real extracted exams
as few-shot style references.

Usage:
    python scripts/generate.py
"""

import os
import sys
import json
import random
from pathlib import Path
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    print("Error: OPENAI_API_KEY not set in .env", file=sys.stderr)
    sys.exit(1)

client = OpenAI(api_key=OPENAI_API_KEY)

ROOT = Path(__file__).resolve().parent.parent
PDF_EXAMS_DIR = ROOT / "exams" / "pdf"
GEN_EXAMS_DIR = ROOT / "exams" / "generated"


def load_examples(n=2):
    """Load n real exam JSONs as few-shot examples."""
    jsons = sorted(PDF_EXAMS_DIR.glob("exam_*.json"))
    if not jsons:
        print("Error: no extracted exams found in exams/pdf/", file=sys.stderr)
        print("Run extract_all.py first to build the example pool.", file=sys.stderr)
        sys.exit(1)
    selected = jsons[:n] if len(jsons) >= n else jsons
    examples = []
    for path in selected:
        with open(path, encoding="utf-8") as f:
            examples.append(json.load(f))
    return examples


def get_next_exam_id():
    """Find the next available generated exam ID."""
    GEN_EXAMS_DIR.mkdir(parents=True, exist_ok=True)
    existing = list(GEN_EXAMS_DIR.glob("exam_g*.json"))
    if not existing:
        return "exam_g01"
    nums = []
    for p in existing:
        m = __import__("re").search(r"g(\d+)", p.stem)
        if m:
            nums.append(int(m.group(1)))
    return f"exam_g{max(nums) + 1:02d}"


def build_generation_prompt(examples):
    """Build the exam generation prompt with few-shot examples."""
    example_json = json.dumps(examples[0], ensure_ascii=False, indent=2)
    if len(examples) > 1:
        example_json_2 = json.dumps(examples[1], ensure_ascii=False, indent=2)
        example_block = f"""## Example Exam 1

{example_json}

## Example Exam 2

{example_json_2}"""
    else:
        example_block = f"## Example Exam\n\n{example_json}"

    prompt = f"""You are a senior TELC B1 German exam editor. Create a brand new, complete B1 exam.

## Style guidance

Write content as if sourced from real German newspapers and magazines. Use natural journalistic German — do NOT simplify vocabulary. The texts should feel authentic: real articles about current topics, real letters from real people, real radio interviews.

Topics should feel current and real: health, work, travel, social issues, science, technology, everyday life.

## Reference exams

Below are real extracted TELC B1 exams. Study the exact style, length, vocabulary level, and structure. Your exam must match this quality.

{example_block}

## Your task

Create a COMPLETELY NEW exam with entirely different content. New topics, new names, new situations, new texts. Do NOT reuse any content from the examples.

Follow the exact JSON structure of the examples. Return ONLY valid JSON — no markdown fences, no commentary.

## Critical requirements

- Leseverstehen Teil 1: 10 unique headlines (a-j), 5 texts (1-5) of 60-100 words each. Headlines must convincingly match exactly one text each.
- Leseverstehen Teil 2: A genuine-feeling article of 250-350 words on a current topic, plus 5 MCQs with 3 options each.
- Leseverstehen Teil 3: 10 realistic situations (11-20) and 10-12 classified ads with letter labels. 2-4 situations should have NO matching ad (answer "x").
- Sprachbausteine Teil 1: A natural letter/text of 150-200 words with 10 grammar gaps (21-30). Each gap should test a specific B1 grammar point. Include the grammar_point explanation.
- Sprachbausteine Teil 2: A natural text of 120-180 words with 10 vocabulary gaps (31-40), plus exactly 15 UPPERCASE words in a word bank (a-o).
- Hörverstehen Teil 1: 5 statements (41-45) on a single topic, 5 named speakers. Mix of true/false answers.
- Hörverstehen Teil 2: 10 statements (46-55) about an interview topic. Mix of true/false.
- Hörverstehen Teil 3: 5 statements (56-60) about various announcements. Mix of true/false.
- Schreiben: A realistic incoming letter from a friend/acquaintance, 4 required points that feel natural and connected to the letter.
- Use the standard TELC B1 numbering exactly as in the examples.
- All audio_status fields: "needs_generation", all generated_script: null.
- audio_file naming: exam_gNN_hoer1.mp3, exam_gNN_hoer2.mp3, exam_gNN_hoer3.mp3.

Return ONLY valid JSON."""

    return prompt


def validate_exam(data):
    """Quick structural validation. Returns list of errors."""
    errors = []
    sec = data.get("sections", {})

    lv = sec.get("leseverstehen", {})
    t1 = lv.get("teil1", {})
    if len(t1.get("headlines", [])) != 10:
        errors.append(f"teil1 headlines: expected 10, got {len(t1.get('headlines', []))}")
    if len(t1.get("texts", [])) != 5:
        errors.append(f"teil1 texts: expected 5, got {len(t1.get('texts', []))}")

    t2 = lv.get("teil2", {})
    if len(t2.get("questions", [])) != 5:
        errors.append(f"teil2 questions: expected 5, got {len(t2.get('questions', []))}")

    t3 = lv.get("teil3", {})
    if len(t3.get("situations", [])) != 10:
        errors.append(f"teil3 situations: expected 10, got {len(t3.get('situations', []))}")

    sb = sec.get("sprachbausteine", {})
    if "teil1" in sb:
        if len(sb["teil1"].get("questions", [])) != 10:
            errors.append(f"sb.teil1 questions: expected 10")
    if "teil2" in sb:
        if len(sb["teil2"].get("word_bank", {})) != 15:
            errors.append(f"sb.teil2 word_bank: expected 15")

    hv = sec.get("hoerverstehen", {})
    if "teil1" in hv:
        if len(hv["teil1"].get("statements", [])) != 5:
            errors.append(f"hv.teil1 statements: expected 5")
    if "teil2" in hv:
        if len(hv["teil2"].get("statements", [])) != 10:
            errors.append(f"hv.teil2 statements: expected 10")
    if "teil3" in hv:
        if len(hv["teil3"].get("statements", [])) != 5:
            errors.append(f"hv.teil3 statements: expected 5")

    sch = sec.get("schreiben", {})
    if len(sch.get("required_points", [])) != 4:
        errors.append(f"schreiben required_points: expected 4")

    return errors


def generate():
    """Main generation pipeline."""
    exam_id = get_next_exam_id()
    print(f"Generating: {exam_id}")

    print("  Loading example exams...")
    examples = load_examples(n=2)
    print(f"  Using {len(examples)} example(s)")

    print("  Building prompt...")
    prompt = build_generation_prompt(examples)
    prompt = prompt.replace("exam_NN", exam_id).replace("exam_gNN", exam_id)

    print(f"  Sending to gpt-4o (prompt: {len(prompt)} chars)...")
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=16000,
    )

    raw = response.choices[0].message.content.strip()
    if raw.startswith("```"):
        parts = raw.split("```")
        raw = parts[1] if len(parts) > 1 else parts[0]
        if raw.startswith("json"):
            raw = raw[4:]
    raw = raw.strip()

    try:
        data = json.loads(raw)
    except json.JSONDecodeError as e:
        debug_path = GEN_EXAMS_DIR / f"{exam_id}_raw.txt"
        GEN_EXAMS_DIR.mkdir(parents=True, exist_ok=True)
        with open(debug_path, "w") as f:
            f.write(raw)
        print(f"  JSON parse error: {e}", file=sys.stderr)
        print(f"  Raw response saved to {debug_path}", file=sys.stderr)
        sys.exit(1)

    # Override exam_id and source
    data["exam_id"] = exam_id
    data["source"] = "generated"
    data["level"] = "B1"

    # Update audio_file paths
    hv = data.get("sections", {}).get("hoerverstehen", {})
    for teil_key in ["teil1", "teil2", "teil3"]:
        teil = hv.get(teil_key, {})
        suffix = teil_key[-1]
        teil["audio_file"] = f"{exam_id}_hoer{suffix}.mp3"
        teil["audio_status"] = "needs_generation"
        teil["generated_script"] = None

    errors = validate_exam(data)
    if errors:
        print(f"  Validation found {len(errors)} issues:", file=sys.stderr)
        for e in errors:
            print(f"    - {e}", file=sys.stderr)
        sys.exit(1)

    GEN_EXAMS_DIR.mkdir(parents=True, exist_ok=True)
    out_path = GEN_EXAMS_DIR / f"{exam_id}.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"  Saved: {out_path}")

    from update_manifest import update
    update()

    print(f"\nNext: generate audio with:")
    print(f"  python scripts/generate_audio.py {out_path}")


def main():
    generate()


if __name__ == "__main__":
    main()
