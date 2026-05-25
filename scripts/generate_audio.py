#!/usr/bin/env python3
"""
Generate Hörverstehen audio for a TELC B1 exam JSON.

Pipeline:
  1. GPT-5 writes German scripts that match the answer key, returned via
     structured outputs (Pydantic schemas). Each script entry carries an
     explicit justification so the model has to verify its own answer.
  2. OpenAI TTS turns each line into MP3.
  3. MP3s are concatenated, saved under ./audio/, and the exam JSON is
     updated with the generated script and audio_status="generated".

Usage:
    python scripts/generate_audio.py exams/pdf/exam_01.json

Env vars (.env):
    OPENAI_API_KEY            (required)
    OPENAI_SCRIPT_MODEL       default: gpt-5
    OPENAI_TTS_MODEL          default: tts-1
    OPENAI_VOICE_FEMALE       default: nova
    OPENAI_VOICE_MALE         default: onyx
    OPENAI_VOICE_ANNOUNCER    default: alloy
"""

import json
import os
import sys
from pathlib import Path
from typing import Literal

from dotenv import load_dotenv
from openai import OpenAI
from pydantic import BaseModel, Field

load_dotenv()

OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    print("Error: OPENAI_API_KEY not set in .env", file=sys.stderr)
    sys.exit(1)

client = OpenAI(api_key=OPENAI_API_KEY)

ROOT = Path(__file__).resolve().parent.parent
AUDIO_DIR = ROOT / "audio"

SCRIPT_MODEL = os.environ.get("OPENAI_SCRIPT_MODEL", "gpt-5")
TTS_MODEL = os.environ.get("OPENAI_TTS_MODEL", "tts-1")
VOICE_FEMALE = os.environ.get("OPENAI_VOICE_FEMALE", "nova")
VOICE_MALE = os.environ.get("OPENAI_VOICE_MALE", "onyx")
VOICE_ANNOUNCER = os.environ.get("OPENAI_VOICE_ANNOUNCER", "alloy")


# ─── Structured-output schemas ─────────────────────────────────────────────

Answer = Literal["richtig", "falsch"]


class Monologue(BaseModel):
    statement_id: int
    speaker: str
    script: str = Field(description="40-60 words of natural spoken German, first-person.")
    justification: str = Field(
        description="One short German sentence quoting what in the script makes the "
        "assigned answer correct."
    )


class Teil1Output(BaseModel):
    monologues: list[Monologue]


class DialogueLine(BaseModel):
    speaker: str
    text: str


class StatementEvidence(BaseModel):
    statement_id: int
    answer: Answer
    quote: str = Field(description="Word-for-word excerpt from the dialogue that decides this statement.")
    explanation: str = Field(description="One short German sentence explaining why the quote makes the statement richtig/falsch.")


class Teil2Output(BaseModel):
    topic: str
    dialogue: list[DialogueLine]
    statement_evidence: list[StatementEvidence] = Field(
        description="Exactly one entry per statement, in the same order as the input."
    )


class Announcement(BaseModel):
    statement_id: int
    setting: str = Field(description="e.g. 'Bahnhof', 'Supermarkt', 'Flughafen', 'Konzerthalle'.")
    script: str = Field(description="30-50 words in the style of a real public announcement.")
    justification: str


class Teil3Output(BaseModel):
    announcements: list[Announcement]


# ─── OpenAI helpers ────────────────────────────────────────────────────────

def parse_structured(prompt: str, schema):
    response = client.chat.completions.parse(
        model=SCRIPT_MODEL,
        messages=[{"role": "user", "content": prompt}],
        response_format=schema,
    )
    msg = response.choices[0].message
    if msg.parsed is None:
        raise RuntimeError(f"{SCRIPT_MODEL} returned no parsed output. Refusal: {msg.refusal!r}")
    return msg.parsed


def text_to_speech(text: str, voice: str) -> bytes:
    response = client.audio.speech.create(
        model=TTS_MODEL,
        voice=voice,
        input=text,
        response_format="mp3",
    )
    return response.content


def concat_mp3s(segments: list[bytes]) -> bytes:
    # Concatenating MP3 frames is good enough for browser <audio> playback.
    return b"".join(segments)


# ─── Speaker / voice utilities ─────────────────────────────────────────────

def speaker_name(speaker, fallback: str) -> str:
    if isinstance(speaker, dict):
        return speaker.get("name") or fallback
    if isinstance(speaker, str):
        return speaker
    return fallback


def guess_voice(name: str) -> str:
    if name.startswith("Frau") or "Moderatorin" in name or "Sprecherin" in name:
        return VOICE_FEMALE
    return VOICE_MALE


# ─── Prompt builders ───────────────────────────────────────────────────────

def format_statements(teil) -> str:
    return "\n".join(
        f"  - id {s['id']}: \"{s['text']}\" → {'richtig' if s['answer'] else 'falsch'}"
        for s in teil["statements"]
    )


def build_teil1_prompt(teil) -> str:
    speakers = teil.get("speakers", [])
    first_id = teil["statements"][0]["id"]
    assignments = []
    for s in teil["statements"]:
        idx = s["id"] - first_id
        name = speaker_name(speakers[idx] if idx < len(speakers) else None, f"Sprecher/in {idx + 1}")
        assignments.append(f"  - id {s['id']} → {name}")

    return f"""You are writing the audio script for a TELC B1 German listening exam (Hörverstehen, Teil 1: five short monologues).

Shared topic: {teil.get('topic', 'Alltag')!r}

Statements with the correct answers (the candidate will be graded against these — your script must make each answer clearly derivable):
{format_statements(teil)}

Speaker assignments:
{chr(10).join(assignments)}

Requirements for each monologue:
  - 40-60 words of natural spoken German, first-person, like a real radio vox-pop.
  - Information clearly implies the assigned answer WITHOUT quoting or paraphrasing the statement.
  - Distinct personalities/registers so the five monologues don't sound interchangeable.
  - In the justification field, quote the German phrase that proves the answer.

Return exactly five monologues, one per statement, in the order shown above."""


def build_teil2_prompt(teil) -> str:
    speakers = teil.get("speakers") or [
        {"role": "interviewer", "name": "Moderatorin", "voice": "female"},
        {"role": "guest", "name": "Experte", "voice": "male"},
    ]
    interviewer = speaker_name(speakers[0], "Moderatorin")
    guest = speaker_name(speakers[1] if len(speakers) > 1 else None, "Experte")

    return f"""You are writing the audio script for a TELC B1 German listening exam (Hörverstehen, Teil 2: one radio interview).

Topic: {teil.get('topic', 'Beruf und Ausbildung')!r}
Interviewer (host): {interviewer}
Guest: {guest}

The dialogue must let a listener correctly answer ALL of these statements (the candidate is graded against the answer key — disagreement is a defect):
{format_statements(teil)}

Requirements:
  - 350-450 words total, 8-14 natural turns.
  - The information deciding each statement must come from the guest, not the host.
  - Use ONLY the two speaker names above.
  - In statement_evidence, return exactly one entry per statement in the same order. Quote a verbatim line from the dialogue (substring match) and explain in German why it makes the statement richtig/falsch.
  - Before finalising, mentally re-read the dialogue and confirm every evidence quote actually appears in it and supports the marked answer."""


def build_teil3_prompt(teil) -> str:
    return f"""You are writing the audio script for a TELC B1 German listening exam (Hörverstehen, Teil 3: five short public announcements / Durchsagen).

Theme: {teil.get('topic', 'Verschiedene Durchsagen')!r}

Statements with the correct answers (the candidate will be graded against these — your script must make each answer clearly derivable):
{format_statements(teil)}

Requirements for each announcement:
  - 30-50 words in the style of a real Durchsage. Vary the settings (Bahnhof, Flughafen, Supermarkt, Konzert, Theater, Kaufhaus, …).
  - Concrete details (times, prices, gates, platforms, products, etc.).
  - The fact deciding the statement must be stated clearly enough for a B1 listener.
  - In the justification field, quote the German phrase that proves the answer.

Return exactly five announcements, one per statement, in the same order shown above."""


# ─── Audio rendering ───────────────────────────────────────────────────────

def render_teil1(teil, script: Teil1Output) -> bytes:
    speakers = teil.get("speakers", [])
    first_id = teil["statements"][0]["id"]
    segments = []
    for m in script.monologues:
        idx = m.statement_id - first_id
        name = speaker_name(speakers[idx] if 0 <= idx < len(speakers) else None, m.speaker)
        voice = guess_voice(name)
        print(f"    TTS [{m.statement_id}] {name} (voice: {voice})")
        segments.append(text_to_speech(m.script, voice))
    return concat_mp3s(segments)


def render_teil2(teil, script: Teil2Output) -> bytes:
    voice_map = {}
    for s in teil.get("speakers") or []:
        name = s["name"] if isinstance(s, dict) else s
        if isinstance(s, dict) and s.get("voice") == "female":
            voice_map[name] = VOICE_FEMALE
        elif isinstance(s, dict) and s.get("voice") == "male":
            voice_map[name] = VOICE_MALE
        else:
            voice_map[name] = guess_voice(name)

    segments = []
    for line in script.dialogue:
        voice = voice_map.get(line.speaker) or guess_voice(line.speaker)
        print(f"    TTS {line.speaker} (voice: {voice})")
        segments.append(text_to_speech(line.text, voice))
    return concat_mp3s(segments)


def render_teil3(teil, script: Teil3Output) -> bytes:
    segments = []
    for a in script.announcements:
        print(f"    TTS [{a.statement_id}] {a.setting} (voice: {VOICE_ANNOUNCER})")
        segments.append(text_to_speech(a.script, VOICE_ANNOUNCER))
    return concat_mp3s(segments)


# ─── Pipeline ──────────────────────────────────────────────────────────────

TEILE = [
    ("teil1", Teil1Output, build_teil1_prompt, render_teil1, "hoer1"),
    ("teil2", Teil2Output, build_teil2_prompt, render_teil2, "hoer2"),
    ("teil3", Teil3Output, build_teil3_prompt, render_teil3, "hoer3"),
]


def process_teil(exam, exam_id, key, schema, build_prompt, render, default_suffix):
    """Process a single Hörverstehen Teil (script generation + audio rendering)."""
    hv = exam.get("sections", {}).get("hoerverstehen", {})
    teil = hv.get(key)
    if not teil:
        return None
    if teil.get("audio_status") not in (None, "needs_generation"):
        print(f"  {exam_id}: skipping {key} (audio_status={teil['audio_status']})")
        return None

    print(f"  {exam_id}: {key} — generating script with {SCRIPT_MODEL}…")
    script = parse_structured(build_prompt(teil), schema)

    print(f"  {exam_id}: {key} — rendering audio with {TTS_MODEL}…")
    audio_bytes = render(teil, script)

    audio_file = teil.get("audio_file") or f"{exam_id}_{default_suffix}.mp3"
    audio_path = AUDIO_DIR / audio_file
    with open(audio_path, "wb") as f:
        f.write(audio_bytes)

    teil["audio_file"] = audio_file
    teil["generated_script"] = script.model_dump()
    teil["audio_status"] = "generated"
    print(f"    saved: {audio_path}")
    return key


def generate_audio(exam_path: Path) -> None:
    if not exam_path.exists():
        print(f"Error: file not found: {exam_path}", file=sys.stderr)
        sys.exit(1)

    with open(exam_path, encoding="utf-8") as f:
        exam = json.load(f)

    exam_id = exam["exam_id"]
    hv = exam.get("sections", {}).get("hoerverstehen", {})
    if not hv:
        print(f"No Hörverstehen section in {exam_id}")
        return

    AUDIO_DIR.mkdir(parents=True, exist_ok=True)

    import concurrent.futures

    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
        futures = []
        for key, schema, build_prompt, render, default_suffix in TEILE:
            future = executor.submit(
                process_teil, exam, exam_id, key, schema, build_prompt, render, default_suffix
            )
            futures.append(future)

        for future in concurrent.futures.as_completed(futures):
            try:
                future.result()
            except Exception as e:
                print(f"  Error: {e}", file=sys.stderr)

    with open(exam_path, "w", encoding="utf-8") as f:
        json.dump(exam, f, ensure_ascii=False, indent=2)
    print(f"  updated: {exam_path}")


def main():
    if len(sys.argv) != 2:
        print(f"Usage: {sys.argv[0]} <exam_json_path>", file=sys.stderr)
        sys.exit(1)
    generate_audio(Path(sys.argv[1]))


if __name__ == "__main__":
    main()
