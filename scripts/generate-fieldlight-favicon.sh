#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "$0")" && pwd)"
site_root="$(cd "$script_dir/.." && pwd)"
source_art="$site_root/assets/fieldlight-origin-master.png"

# Derive every public icon from the same high-resolution Fieldlight mark: a
# luminous nucleus expanding simultaneously at cellular and cosmic scale.
sips -z 512 512 "$source_art" \
  --out "$site_root/assets/fieldlight-mark.png" >/dev/null
sips -z 180 180 "$site_root/assets/fieldlight-mark.png" \
  --out "$site_root/assets/apple-touch-icon.png" >/dev/null
sips -z 48 48 "$site_root/assets/fieldlight-mark.png" \
  --out "$site_root/assets/favicon-48.png" >/dev/null
sips -s format ico "$site_root/assets/favicon-48.png" \
  --out "$site_root/favicon.ico" >/dev/null
