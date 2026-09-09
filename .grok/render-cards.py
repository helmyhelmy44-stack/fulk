#!/usr/bin/env python3
"""Stage FALAK OG + X-banner HTML (vector key art, exact bilingual type)."""
from __future__ import annotations

import random
from pathlib import Path

ROOT = Path("/workspace/.grok")
OUT = ROOT


def stars(rng: random.Random, w: int, h: int, n: int) -> str:
    parts = []
    for _ in range(n):
        x = round(rng.uniform(0, w), 2)
        y = round(rng.uniform(0, h), 2)
        r = round(rng.choice([0.35, 0.5, 0.7, 0.9, 1.15, 1.5]), 2)
        o = round(rng.uniform(0.18, 0.95), 3)
        c = rng.choice(["#eceef2", "#9eb0c4", "#ffffff"])
        parts.append(
            f'<circle cx="{x}" cy="{y}" r="{r}" fill="{c}" opacity="{o}"/>'
        )
    return "\n    ".join(parts)


def fighter(scale: float = 1.0, rot: float = 0.0, x: float = 0, y: float = 0) -> str:
    return f"""
  <g transform="translate({x},{y}) rotate({rot}) scale({scale})">
    <ellipse cx="0" cy="58" rx="18" ry="40" fill="url(#engineGlow)"/>
    <ellipse cx="0" cy="70" rx="7" ry="28" fill="#eceef2" opacity="0.45"/>
    <path d="M0 -72 L16 -14 L54 30 L18 12 L12 48 L0 30 L-12 48 L-18 12 L-54 30 L-16 -14 Z"
          fill="url(#hull)" stroke="#9eb0c4" stroke-width="1.4" stroke-linejoin="round"/>
    <path d="M0 -72 L8 6 L5 44 L0 32 L-5 44 L-8 6 Z" fill="#ffffff"/>
    <path d="M-54 30 L-18 12 L-14 -8" fill="none" stroke="#9eb0c4" stroke-width="1" opacity="0.7"/>
    <path d="M54 30 L18 12 L14 -8" fill="none" stroke="#9eb0c4" stroke-width="1" opacity="0.7"/>
    <ellipse cx="0" cy="-26" rx="5" ry="13" fill="#6a8aa8"/>
    <ellipse cx="-1.4" cy="-30" rx="1.8" ry="5" fill="#eceef2" opacity="0.75"/>
    <rect x="-11" y="38" width="8" height="12" rx="1.5" fill="#9eb0c4"/>
    <rect x="3" y="38" width="8" height="12" rx="1.5" fill="#9eb0c4"/>
    <rect x="-9.5" y="40" width="5" height="7" rx="1" fill="#eceef2"/>
    <rect x="4.5" y="40" width="5" height="7" rx="1" fill="#eceef2"/>
  </g>"""


def enemy(x: float, y: float, s: float = 1.0, rot: float = 180) -> str:
    return f"""
  <g transform="translate({x},{y}) rotate({rot}) scale({s})" opacity="0.9">
    <path d="M0 -16 L10 6 L4 16 L-4 16 L-10 6 Z"
          fill="#12141a" stroke="#9eb0c4" stroke-width="1.1"/>
    <circle cx="0" cy="2" r="2.2" fill="#9eb0c4"/>
  </g>"""


DEFS = """
  <defs>
    <radialGradient id="engineGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#eceef2" stop-opacity="0.95"/>
      <stop offset="35%" stop-color="#9eb0c4" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#07080c" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="hull" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="55%" stop-color="#eceef2"/>
      <stop offset="100%" stop-color="#9eb0c4"/>
    </linearGradient>
    <radialGradient id="nebula" cx="50%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#9eb0c4" stop-opacity="0.14"/>
      <stop offset="55%" stop-color="#12141a" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#07080c" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="vignette" cx="50%" cy="50%" r="72%">
      <stop offset="60%" stop-color="#07080c" stop-opacity="0"/>
      <stop offset="100%" stop-color="#07080c" stop-opacity="0.72"/>
    </radialGradient>
  </defs>
"""

FONT_CSS = """
@font-face {
  font-family: 'Noto Sans Arabic';
  src: url('fonts/NotoSansArabic-ExtraBold.ttf') format('truetype');
  font-weight: 800;
  font-style: normal;
}
@font-face {
  font-family: 'Orbitron';
  src: url('fonts/Orbitron-ExtraBold.ttf') format('truetype');
  font-weight: 800;
  font-style: normal;
}
@font-face {
  font-family: 'Rajdhani';
  src: url('fonts/Rajdhani-Bold.ttf') format('truetype');
  font-weight: 700;
  font-style: normal;
}
html, body { margin: 0; padding: 0; width: 100%; height: 100%; background: #07080c; overflow: hidden; }
* { box-sizing: border-box; }
.stage { position: relative; width: 100%; height: 100%; background: #07080c; }
.stage svg.bg { position: absolute; inset: 0; width: 100%; height: 100%; }
.lockup { position: absolute; text-align: center; color: #eceef2; pointer-events: none; }
.ar {
  font-family: 'Noto Sans Arabic', sans-serif;
  font-weight: 800;
  color: #eceef2;
  line-height: 1;
  direction: rtl;
  text-shadow: 0 0 32px rgba(158,176,196,0.5), 0 2px 12px rgba(0,0,0,0.85);
}
.lat {
  font-family: 'Orbitron', sans-serif;
  font-weight: 800;
  color: #9eb0c4;
  line-height: 1;
  letter-spacing: 0.38em;
  margin-left: 0.38em;
  text-shadow: 0 0 22px rgba(158,176,196,0.45);
}
.rule {
  height: 1.5px;
  background: linear-gradient(90deg, transparent, #9eb0c4, transparent);
  margin: 10px auto 12px;
}
.tag {
  font-family: 'Rajdhani', sans-serif;
  font-weight: 700;
  color: #9eb0c4;
  letter-spacing: 0.46em;
  margin-left: 0.46em;
  text-transform: uppercase;
  opacity: 0.85;
}
"""


def og_html() -> str:
    rng = random.Random(falak_seed := 1307)
    star = stars(rng, 1200, 630, 220)
    enemies = "".join(
        enemy(x, y, s, 180)
        for (x, y, s) in [
            (250, 92, 0.85),
            (330, 70, 0.7),
            (410, 96, 0.78),
            (790, 88, 0.8),
            (870, 66, 0.68),
            (950, 94, 0.82),
            (180, 140, 0.55),
            (1020, 138, 0.55),
            (600, 58, 0.62),
        ]
    )
    return f"""<!doctype html>
<html lang="ar">
<head>
<meta charset="utf-8"/>
<style>
{FONT_CSS}
.lockup {{
  left: 50%;
  top: 168px;
  transform: translateX(-50%);
  width: 720px;
}}
.ar {{ font-size: 108px; }}
.lat {{ font-size: 40px; }}
.rule {{ width: 220px; }}
.tag {{ font-size: 15px; margin-top: 10px; }}
</style>
</head>
<body>
<div class="stage">
<svg class="bg" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
{DEFS}
  <rect width="1200" height="630" fill="#07080c"/>
  <ellipse cx="600" cy="280" rx="520" ry="260" fill="url(#nebula)"/>
  <ellipse cx="210" cy="480" rx="220" ry="90" fill="#12141a" opacity="0.55"/>
  <ellipse cx="1000" cy="160" rx="180" ry="80" fill="#12141a" opacity="0.4"/>
  {star}
  <g fill="none" stroke="#9eb0c4" stroke-width="1.15" opacity="0.32">
    <ellipse cx="600" cy="250" rx="310" ry="96" transform="rotate(-16 600 250)"/>
    <ellipse cx="600" cy="250" rx="250" ry="78" transform="rotate(22 600 250)"/>
    <ellipse cx="600" cy="250" rx="360" ry="118" transform="rotate(8 600 250)" opacity="0.7"/>
  </g>
  <circle cx="600" cy="250" r="3.2" fill="#eceef2" opacity="0.8"/>
  {enemies}
  {fighter(1.12, 0, 600, 468)}
  <rect width="1200" height="630" fill="url(#vignette)"/>
</svg>
<div class="lockup">
  <div class="ar">فلك</div>
  <div class="rule"></div>
  <div class="lat">FALAK</div>
  <div class="tag">SPACE SHOOTER</div>
</div>
</div>
</body>
</html>
"""


def banner_html() -> str:
    rng = random.Random(2711)
    star = stars(rng, 1200, 264, 140)
    enemies = "".join(
        enemy(x, y, s, 90)
        for (x, y, s) in [
            (980, 78, 0.72),
            (1048, 108, 0.6),
            (1110, 70, 0.55),
            (920, 128, 0.5),
            (1080, 150, 0.48),
        ]
    )
    return f"""<!doctype html>
<html lang="ar">
<head>
<meta charset="utf-8"/>
<style>
{FONT_CSS}
.lockup {{
  left: 48px;
  top: 28px;
  width: 520px;
  text-align: left;
}}
.ar {{ font-size: 64px; text-align: left; }}
.lat {{ font-size: 22px; letter-spacing: 0.32em; margin-left: 0.08em; }}
.rule {{ width: 140px; margin: 8px 0 8px; }}
.tag {{ font-size: 12px; letter-spacing: 0.4em; margin-left: 0.08em; margin-top: 6px; }}
</style>
</head>
<body>
<div class="stage">
<svg class="bg" viewBox="0 0 1200 264" xmlns="http://www.w3.org/2000/svg">
{DEFS}
  <rect width="1200" height="264" fill="#07080c"/>
  <ellipse cx="420" cy="110" rx="380" ry="140" fill="url(#nebula)"/>
  <ellipse cx="980" cy="90" rx="220" ry="90" fill="#12141a" opacity="0.45"/>
  {star}
  <g fill="none" stroke="#9eb0c4" stroke-width="1" opacity="0.28">
    <ellipse cx="220" cy="96" rx="190" ry="52" transform="rotate(-12 220 96)"/>
    <ellipse cx="220" cy="96" rx="150" ry="40" transform="rotate(18 220 96)"/>
  </g>
  {enemies}
  {fighter(0.78, 90, 620, 118)}
  <rect width="1200" height="264" fill="url(#vignette)"/>
</svg>
<div class="lockup">
  <div class="ar">فلك</div>
  <div class="rule"></div>
  <div class="lat">FALAK</div>
  <div class="tag">SPACE SHOOTER</div>
</div>
</div>
</body>
</html>
"""


def main() -> None:
    (OUT / "og-card.html").write_text(og_html(), encoding="utf-8")
    (OUT / "x-banner.html").write_text(banner_html(), encoding="utf-8")
    print("wrote", OUT / "og-card.html")
    print("wrote", OUT / "x-banner.html")


if __name__ == "__main__":
    main()
