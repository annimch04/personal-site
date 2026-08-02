#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "$0")" && pwd)"
site_root="$(cd "$script_dir/.." && pwd)"
source_card="$site_root/assets/institute/participant-charter-social.png"
task_temp_dir="$(mktemp -d)"

cleanup() {
  rm -rf "$task_temp_dir"
}
trap cleanup EXIT

# Extract the exact field environment from the original Participant Charter
# artwork. The native compositor crops and repairs source pixels; it does not
# redraw the rings, axis, terminals, bracket, grid, or registration marks.
swift "$script_dir/generate-fieldlight-favicon.swift" \
  "$source_card" \
  "$task_temp_dir/fieldlight-mark-source.png"

sips -z 512 512 "$task_temp_dir/fieldlight-mark-source.png" \
  --out "$site_root/assets/fieldlight-mark.png" >/dev/null
sips -z 180 180 "$site_root/assets/fieldlight-mark.png" \
  --out "$site_root/assets/apple-touch-icon.png" >/dev/null
sips -z 48 48 "$site_root/assets/fieldlight-mark.png" \
  --out "$site_root/assets/favicon-48.png" >/dev/null
sips -s format ico "$site_root/assets/favicon-48.png" \
  --out "$site_root/favicon.ico" >/dev/null
