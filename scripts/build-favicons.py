#!/usr/bin/env python3
"""
Regenerate the full modern favicon set from logo-icon.png.

Old setup was a transparent cat at 16/32px — Google's container background
showed through and the thin sketchy strokes disappeared into anti-aliased
grey, leaving a near-empty white blob in search results.

New setup: composite the existing cat artwork onto a solid white square
with ~8% inner padding (keeps ears clear of iOS apple-touch corner
rounding), generate every size modern browsers and search engines want.

Run from repo root: python3 scripts/build-favicons.py
"""
from pathlib import Path
from PIL import Image

REPO = Path(__file__).resolve().parent.parent
SRC = REPO / "logo-icon.png"
BG = (10, 10, 10, 255)  # #0a0a0a — matches the site's bg-base-950
PAD_FRACTION = 0.08

# Each entry: (output filename, pixel size)
PNG_TARGETS = [
    ("favicon-16x16.png", 16),
    ("favicon-32x32.png", 32),
    ("favicon-48x48.png", 48),
    ("apple-touch-icon.png", 180),
    ("android-chrome-192x192.png", 192),
    ("android-chrome-512x512.png", 512),
]

ICO_SIZES = [16, 32, 48]


def composed(size: int) -> Image.Image:
    """Return RGBA square of `size`px: white bg + cat centered with padding."""
    src = Image.open(SRC).convert("RGBA")
    inner = max(1, int(size * (1 - 2 * PAD_FRACTION)))
    cat = src.resize((inner, inner), Image.LANCZOS)
    canvas = Image.new("RGBA", (size, size), BG)
    offset = (size - inner) // 2
    canvas.paste(cat, (offset, offset), cat)  # cat alpha as mask
    return canvas


def main() -> None:
    if not SRC.exists():
        raise SystemExit(f"missing source: {SRC}")
    cache: dict[int, Image.Image] = {}
    for filename, size in PNG_TARGETS:
        img = composed(size)
        cache[size] = img
        out = REPO / filename
        img.save(out, format="PNG", optimize=True)
        print(f"  wrote {filename}  {size}x{size}")

    ico_imgs = [cache.get(s) or composed(s) for s in ICO_SIZES]
    ico_path = REPO / "favicon.ico"
    ico_imgs[0].save(
        ico_path,
        format="ICO",
        sizes=[(s, s) for s in ICO_SIZES],
        append_images=ico_imgs[1:],
    )
    print(f"  wrote favicon.ico  ({', '.join(f'{s}x{s}' for s in ICO_SIZES)})")

    manifest = REPO / "site.webmanifest"
    manifest.write_text(
        '{\n'
        '  "name": "Black Cat Analytics",\n'
        '  "short_name": "Black Cat",\n'
        '  "icons": [\n'
        '    { "src": "/android-chrome-192x192.png", "sizes": "192x192", "type": "image/png" },\n'
        '    { "src": "/android-chrome-512x512.png", "sizes": "512x512", "type": "image/png" }\n'
        '  ],\n'
        '  "theme_color": "#0a0a0a",\n'
        '  "background_color": "#0a0a0a",\n'
        '  "display": "standalone",\n'
        '  "start_url": "/"\n'
        '}\n'
    )
    print("  wrote site.webmanifest")


if __name__ == "__main__":
    main()
