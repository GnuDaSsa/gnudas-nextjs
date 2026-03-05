#!/bin/zsh
set -euo pipefail

STATE_FILE="/tmp/openclaw-coding-notifier.state"
LOCK_DIR="/tmp/openclaw-coding-notifier.lockdir"

# Lightweight lock (macOS-safe)
if ! mkdir "$LOCK_DIR" 2>/dev/null; then
  exit 0
fi
trap 'rmdir "$LOCK_DIR" >/dev/null 2>&1 || true' EXIT

# Detect coding-related processes (customize as needed)
if pgrep -fl 'openclaw|codex|claude|next dev|npm run dev' >/dev/null 2>&1; then
  now=1
else
  now=0
fi

prev=0
if [[ -f "$STATE_FILE" ]]; then
  prev=$(cat "$STATE_FILE" 2>/dev/null || echo 0)
fi

if [[ "$now" == "1" && "$prev" != "1" ]]; then
  osascript -e 'display notification "에이전트들이 업무 시작했어." with title "OpenClaw Live Coding" subtitle "로컬 코딩 작업 감지" sound name "Glass"'
fi

echo "$now" > "$STATE_FILE"
