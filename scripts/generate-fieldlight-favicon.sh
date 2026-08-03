#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "$0")" && pwd)"
site_root="$(cd "$script_dir/.." && pwd)"
source_art="$site_root/assets/fieldlight-origin-master.png"
transparent_art="$(mktemp -t fieldlight-origin-transparent.XXXXXX.png)"
trap 'rm -f "$transparent_art"' EXIT

# Lift the exact explosion from its original dark field, then derive every
# public icon from the same transparent high-resolution mark.
python3 "$script_dir/render-transparent-fieldlight-mark.py" \
  "$source_art" "$transparent_art"
sips -z 512 512 "$transparent_art" \
  --out "$site_root/assets/fieldlight-mark.png" >/dev/null
sips -z 180 180 "$site_root/assets/fieldlight-mark.png" \
  --out "$site_root/assets/apple-touch-icon.png" >/dev/null
sips -z 48 48 "$site_root/assets/fieldlight-mark.png" \
  --out "$site_root/assets/favicon-48.png" >/dev/null
sips -s format ico "$site_root/assets/favicon-48.png" \
  --out "$site_root/favicon.ico" >/dev/null
