#!/usr/bin/env bash
set -euo pipefail

# scripts/new-cv.sh [fichier-source]
# Crée une nouvelle variante de CV avec un id aléatoire à 6 caractères,
# en copiant un fichier source existant (par défaut cv.md).

SRC="${1:-cv.md}"
CHARS='ABCDEFGHJKMNPQRSTUVWXYZ23456789'  # sans 0/O, 1/I/L pour éviter les confusions
ID_LEN=6

if [ ! -f "$SRC" ]; then
  echo "Erreur : fichier source introuvable : $SRC" >&2
  exit 1
fi

ID=$( (LC_ALL=C tr -dc "$CHARS" < /dev/urandom || true) | head -c "$ID_LEN")

mkdir -p cv
DEST="cv/${ID}.md"

if [ -e "$DEST" ]; then
  echo "Erreur : collision d'id, relancez le script." >&2
  exit 1
fi

cp "$SRC" "$DEST"

echo "CV créé : $DEST"
echo ""
echo "URL de production : https://radouane.pages.dev/?cv=${ID}"
echo "URL locale (avec python3 -m http.server 8080) : http://localhost:8080/?cv=${ID}"
