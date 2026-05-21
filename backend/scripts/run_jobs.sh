#!/usr/bin/env bash

echo "SCRIPT STARTED $(date)" >> /tmp/saasbets_test.log

PROJECT_DIR="$HOME/Projects/saas-betting/backend"

LOG_DIR="$PROJECT_DIR/logs"

mkdir -p "$LOG_DIR"

JOB=$1

echo "🚀 START $(date)" >> "$LOG_DIR/$JOB.log"

cd "$PROJECT_DIR"

"$PROJECT_DIR/venv/bin/python" -m scripts.$JOB >> "$LOG_DIR/$JOB.log" 2>&1

echo "✅ END $(date)" >> "$LOG_DIR/$JOB.log"

echo "" >> "$LOG_DIR/$JOB.log"