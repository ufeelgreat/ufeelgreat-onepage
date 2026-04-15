"""
Génère les timestamps mot-par-mot pour les témoignages audio via Whisper.
Produit un fichier JSON par fichier audio, dans le même dossier.

Usage :
    pip install openai-whisper
    python tools/whisper_timestamps.py

Modèle utilisé : "base" — bon équilibre vitesse/précision pour fichiers courts.
Passer "tiny" si tu veux encore plus rapide, "small" pour plus précis.
"""

import whisper
import json
import os

MODEL = "base"

AUDIO_FILES = [
    ("website/content/marc-andre-FR.mp3",  "fr"),
    ("website/content/marc-andre-ENG.mp3", "en"),
    ("website/content/guillaume-FR.mp3",   "fr"),
    ("website/content/guillaume-ENG.mp3",  "en"),
    ("website/content/genevieve-FR.mp3",   "fr"),
    ("website/content/genevieve-ENG.mp3",  "en"),
]

def extract_word_timestamps(model, audio_path, language):
    print(f"  Transcription : {audio_path}")
    result = model.transcribe(
        audio_path,
        language=language,
        word_timestamps=True,
        verbose=False
    )

    words = []
    for segment in result.get("segments", []):
        for w in segment.get("words", []):
            words.append({
                "word":  w["word"].strip(),
                "start": round(w["start"], 3),
                "end":   round(w["end"],   3),
            })
    return words


def main():
    # Résoudre les chemins par rapport à ce script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)

    print(f"Chargement du modèle Whisper '{MODEL}'...")
    model = whisper.load_model(MODEL)
    print("Modèle chargé.\n")

    for rel_path, lang in AUDIO_FILES:
        audio_path = os.path.join(project_root, rel_path)

        if not os.path.exists(audio_path):
            print(f"  ABSENT — {audio_path}")
            continue

        words = extract_word_timestamps(model, audio_path, lang)

        # Fichier de sortie : même nom, extension .json
        out_path = os.path.splitext(audio_path)[0] + ".json"
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(words, f, ensure_ascii=False, indent=2)

        print(f"  -> {len(words)} mots -> {out_path}\n")

    print("Terminé. Transmets les fichiers .json à Claude pour intégration.")


if __name__ == "__main__":
    main()
