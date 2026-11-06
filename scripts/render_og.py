"""Render the original vector social image into a widely supported PNG."""
from pathlib import Path
import cairosvg
ROOT=Path(__file__).resolve().parents[1]
cairosvg.svg2png(url=str(ROOT/"og-draft.svg"),write_to=str(ROOT/"og-cover.png"),output_width=1200,output_height=630)
print("Generated 1200x630 og-cover.png")
