"""Remplace dans les fichiers texte les refs .png/.jpg/.jpeg vers webp
pour les images converties (ticker, profile, hero, portfolio, testimonials).
Ne touche pas apple-touch-icon.png ni les autres assets."""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
WEBSITE = ROOT / "website"

FOLDERS = ["ticker", "profile", "hero", "portfolio", "testimonials"]
TARGETS = [
    WEBSITE / "index.html",
    WEBSITE / "content" / "content.json",
    WEBSITE / "content" / "content-en.json",
    WEBSITE / "script.js",
]

pattern = re.compile(
    r"(assets/images/(?:" + "|".join(FOLDERS) + r")/[\w\-]+)\.(png|jpe?g)",
    re.IGNORECASE,
)

for file in TARGETS:
    if not file.exists():
        print(f"skip {file} (absent)")
        continue
    text = file.read_text(encoding="utf-8")
    new, count = pattern.subn(r"\1.webp", text)
    if count:
        file.write_text(new, encoding="utf-8")
        print(f"{file.relative_to(ROOT)}: {count} refs mises a jour")
    else:
        print(f"{file.relative_to(ROOT)}: aucune ref a changer")
