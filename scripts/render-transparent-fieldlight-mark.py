#!/usr/bin/env python3
"""Lift the Fieldlight explosion from its dark source field onto transparency."""

from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image


def smoothstep(low: float, high: float, value: float) -> float:
    position = min(1.0, max(0.0, (value - low) / (high - low)))
    return position * position * (3.0 - (2.0 * position))


def render(source_path: Path, output_path: Path) -> None:
    source = Image.open(source_path).convert("RGB")
    transparent = Image.new("RGBA", source.size)

    lifted_pixels: list[tuple[int, int, int, int]] = []
    for red, green, blue in source.getdata():
        brightest = max(red, green, blue)
        saturation = brightest - min(red, green, blue)

        # The source field is a nearly black navy. Two softly feathered masks
        # retain both luminous white structure and saturated colored rays while
        # allowing the dark square around the explosion to disappear entirely.
        light_mask = smoothstep(42.0, 132.0, float(brightest))
        color_mask = smoothstep(34.0, 82.0, float(saturation)) * smoothstep(
            48.0, 100.0, float(brightest)
        )
        alpha = max(light_mask, color_mask)
        if alpha < 0.018:
            alpha = 0.0

        lifted_pixels.append((red, green, blue, round(alpha * 255.0)))

    transparent.putdata(lifted_pixels)
    transparent.save(output_path, format="PNG", optimize=True)


if __name__ == "__main__":
    if len(sys.argv) != 3:
        raise SystemExit("usage: render-transparent-fieldlight-mark.py SOURCE OUTPUT")
    render(Path(sys.argv[1]), Path(sys.argv[2]))
