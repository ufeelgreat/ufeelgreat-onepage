"""Convertit les images PNG/JPG du site en WebP (qualité 82)."""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent / "website" / "assets" / "images"

TARGETS = [
    (ROOT / "ticker", ("*.png",)),
    (ROOT / "profile", ("*.png",)),
    (ROOT / "hero", ("*.jpg", "*.jpeg")),
    (ROOT / "portfolio", ("*.png", "*.jpg", "*.jpeg")),
    (ROOT / "testimonials", ("*.png", "*.jpg", "*.jpeg")),
]

QUALITY = 82
total_before = 0
total_after = 0

for folder, patterns in TARGETS:
    if not folder.exists():
        continue
    files = []
    for p in patterns:
        files.extend(folder.glob(p))
    for src in files:
        dst = src.with_suffix(".webp")
        if dst.exists():
            continue
        img = Image.open(src)
        save_kwargs = {"quality": QUALITY, "method": 6}
        if img.mode in ("RGBA", "LA") or (img.mode == "P" and "transparency" in img.info):
            img.save(dst, "WEBP", **save_kwargs)
        else:
            img.convert("RGB").save(dst, "WEBP", **save_kwargs)
        before = src.stat().st_size
        after = dst.stat().st_size
        total_before += before
        total_after += after
        print(f"{src.relative_to(ROOT)}: {before/1024:.0f} KB -> {after/1024:.0f} KB")

if total_before:
    saved = (total_before - total_after) / total_before * 100
    print(f"\nTotal: {total_before/1024/1024:.2f} MB -> {total_after/1024/1024:.2f} MB (-{saved:.1f}%)")
