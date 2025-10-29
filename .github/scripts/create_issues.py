#!/usr/bin/env python3
import os
import re
import subprocess
import sys
from pathlib import Path

REQUIRED_FINAL_LINE = "Start with the development branch and create pull request to it as well."
ISSUES_DIR = Path("issues")
PATTERN = re.compile(r"issue_(\d+)\.md$")

def error(msg: str):
    print(f"::error::{msg}", file=sys.stderr)

def warning(msg: str):
    print(f"::warning::{msg}", file=sys.stderr)

def find_issue_files():
    if not ISSUES_DIR.exists():
        error(f"Directory {ISSUES_DIR} does not exist")
        return []
    files = []
    for f in ISSUES_DIR.glob("issue_*.md"):
        m = PATTERN.match(f.name)
        if m:
            num = int(m.group(1))
            files.append((num, f))
    return [f for _, f in sorted(files, key=lambda x: x[0])]

def parse_issue(file_path: Path):
    labels = title = None
    body_lines = []
    in_body = False
    with file_path.open("r", encoding="utf-8") as fh:
        for line in fh:
            stripped = line.rstrip("\n")
            if labels is None and stripped.startswith("labels:"):
                labels = stripped[len("labels:"):].strip()
                continue
            if title is None and stripped.startswith("title:"):
                title = stripped[len("title:"):].strip()
                continue
            if stripped == "body:" and not in_body:
                in_body = True
                continue
            if in_body:
                body_lines.append(line)
    body_text = "".join(body_lines).rstrip()
    return labels, title, body_text

def validate_issue(labels, title, body_text, file_path: Path):
    ok = True
    if labels is None:
        error(f"{file_path}: missing labels line")
        ok = False
    if not title:
        error(f"{file_path}: missing title")
        ok = False
    if not body_text:
        error(f"{file_path}: empty body")
        ok = False
    # Last non-empty line must match required sentence
    last_line = ""
    for line in body_text.splitlines()[::-1]:
        if line.strip():
            last_line = line.strip()
            break
    if last_line != REQUIRED_FINAL_LINE:
        error(f"{file_path}: final line mismatch (got: '{last_line}')")
        ok = False
    return ok

def create_issue(repo: str, labels: str, title: str, body_text: str):
    # Write body to temp file
    tmp = Path("body_content.md")
    tmp.write_text(body_text, encoding="utf-8")
    label_flags = []
    if labels:
        for raw in labels.split(","):
            lab = raw.strip()
            if lab:
                label_flags.extend(["--label", lab])
    cmd = ["gh", "issue", "create", "--repo", repo, "--title", title, "--body-file", str(tmp)] + label_flags
    print(f"Creating issue: {title} labels={labels}")
    try:
        subprocess.check_call(cmd)
    except subprocess.CalledProcessError as e:
        error(f"Failed to create issue '{title}': {e}")
        return False
    finally:
        try:
            tmp.unlink(missing_ok=True)
        except Exception:
            pass
    return True

def main():
    repo = os.environ.get("GITHUB_REPOSITORY")
    if not repo:
        error("GITHUB_REPOSITORY env not set")
        return 1
    issue_files = find_issue_files()
    if not issue_files:
        error("No issue_*.md files found")
        return 1
    created = 0
    for fp in issue_files:
        labels, title, body = parse_issue(fp)
        if not validate_issue(labels, title, body, fp):
            warning(f"Skipping {fp} due to validation errors")
            continue
        if create_issue(repo, labels, title, body):
            created += 1
    print(f"Total created issues: {created}")
    if created == 0:
        warning("No issues created")
    return 0

if __name__ == "__main__":
    sys.exit(main())
