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

# This crop is the right-hand field diagram from the original, lossless
# Participant Charter share card. Keep the icon derived from the artwork;
# do not redraw the rings, violet axis, bracket, grid, or registration marks.
sips -c 494 451 --cropOffset 67 749 \
  "$source_card" \
  --out "$task_temp_dir/field-motif.png" >/dev/null

sips -p 494 494 --padColor 071923 \
  "$task_temp_dir/field-motif.png" \
  --out "$task_temp_dir/field-motif-square.png" >/dev/null

sips -z 512 512 "$task_temp_dir/field-motif-square.png" \
  --out "$site_root/assets/fieldlight-mark.png" >/dev/null
sips -z 180 180 "$site_root/assets/fieldlight-mark.png" \
  --out "$site_root/assets/apple-touch-icon.png" >/dev/null
sips -z 48 48 "$site_root/assets/fieldlight-mark.png" \
  --out "$site_root/assets/favicon-48.png" >/dev/null
sips -s format ico "$site_root/assets/favicon-48.png" \
  --out "$site_root/favicon.ico" >/dev/null
