#!/usr/bin/env python3
"""Generate exams/index.json manifest listing all available exams."""

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
EXAMS_DIR = ROOT / "exams"


def update():
    manifest = []
    for source_dir in ["pdf", "generated"]:
        d = EXAMS_DIR / source_dir
        if not d.exists():
            continue
        for json_path in sorted(d.glob("*.json")):
            try:
                with open(json_path, encoding="utf-8") as f:
                    exam = json.load(f)
                manifest.append({
                    "exam_id": exam.get("exam_id", json_path.stem),
                    "source": exam.get("source", source_dir),
                    "path": f"{source_dir}/{json_path.name}"
                })
            except (json.JSONDecodeError, KeyError):
                pass

    with open(EXAMS_DIR / "index.json", "w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)
    print(f"Manifest: {len(manifest)} exams listed")


if __name__ == "__main__":
    update()
