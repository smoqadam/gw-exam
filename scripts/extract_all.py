#!/usr/bin/env python3
"""
Batch extract all TELC B1 PDFs in pdfs/ to JSON in exams/pdf/.

Skips PDFs that already have a corresponding JSON file.

Usage:
    python scripts/extract_all.py
"""

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PDFS_DIR = ROOT / "pdfs"
EXAMS_DIR = ROOT / "exams" / "pdf"

sys.path.insert(0, str(Path(__file__).resolve().parent))
from extract import extract


def main():
    pdfs = sorted(PDFS_DIR.glob("*.pdf"))
    if not pdfs:
        print("No PDFs found in pdfs/")
        return

    total = len(pdfs)
    processed = 0
    skipped = 0
    failed = 0

    for pdf_path in pdfs:
        stem = pdf_path.stem
        import re
        num_match = re.search(r"(\d+)", stem)
        exam_id = f"exam_{num_match.group(1).zfill(2)}" if num_match else stem

        json_path = EXAMS_DIR / f"{exam_id}.json"
        if json_path.exists():
            print(f"[{processed + skipped + failed + 1}/{total}] {pdf_path.name} → {exam_id}  (skip: already exists)")
            skipped += 1
            continue

        print(f"\n[{processed + skipped + failed + 1}/{total}] {pdf_path.name} → {exam_id}")
        try:
            extract(str(pdf_path))
            processed += 1
        except SystemExit as e:
            if e.code != 0:
                failed += 1
                print(f"  FAILED (exit code {e.code})")
            else:
                processed += 1
        except Exception as e:
            failed += 1
            print(f"  FAILED: {e}")

    from update_manifest import update
    update()
    print(f"\nDone. {processed} extracted, {skipped} skipped, {failed} failed.")


if __name__ == "__main__":
    main()
