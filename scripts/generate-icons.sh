#!/bin/bash
# generate-icons.sh
# Converts public/icon.svg to 192x192 and 512x512 PNG app icons.
# Requires either rsvg-convert (from librsvg) or ImageMagick (convert).
# macOS sips cannot convert SVG, so we use one of the above.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
PUBLIC_DIR="$PROJECT_DIR/public"
SVG_SOURCE="$PUBLIC_DIR/icon.svg"

if [ ! -f "$SVG_SOURCE" ]; then
  echo "Error: $SVG_SOURCE not found"
  exit 1
fi

# Try rsvg-convert first (brew install librsvg), then fall back to ImageMagick
if command -v rsvg-convert &>/dev/null; then
  echo "Using rsvg-convert..."
  rsvg-convert -w 192 -h 192 "$SVG_SOURCE" -o "$PUBLIC_DIR/icon-192.png"
  rsvg-convert -w 512 -h 512 "$SVG_SOURCE" -o "$PUBLIC_DIR/icon-512.png"
elif command -v convert &>/dev/null; then
  echo "Using ImageMagick convert..."
  convert -background none -resize 192x192 "$SVG_SOURCE" "$PUBLIC_DIR/icon-192.png"
  convert -background none -resize 512x512 "$SVG_SOURCE" "$PUBLIC_DIR/icon-512.png"
elif command -v magick &>/dev/null; then
  echo "Using ImageMagick 7 (magick)..."
  magick -background none -resize 192x192 "$SVG_SOURCE" "$PUBLIC_DIR/icon-192.png"
  magick -background none -resize 512x512 "$SVG_SOURCE" "$PUBLIC_DIR/icon-512.png"
else
  echo "Error: No SVG-to-PNG converter found."
  echo "Install one of:"
  echo "  brew install librsvg    # provides rsvg-convert"
  echo "  brew install imagemagick # provides convert / magick"
  exit 1
fi

# Generate apple-touch-icon (180x180) from the 192 version using sips
if [ -f "$PUBLIC_DIR/icon-192.png" ]; then
  cp "$PUBLIC_DIR/icon-192.png" "$PUBLIC_DIR/apple-touch-icon.png"
  sips -z 180 180 "$PUBLIC_DIR/apple-touch-icon.png" --out "$PUBLIC_DIR/apple-touch-icon.png" >/dev/null 2>&1
  echo "Created apple-touch-icon.png (180x180)"
fi

echo "Done! Generated:"
echo "  $PUBLIC_DIR/icon-192.png  (192x192)"
echo "  $PUBLIC_DIR/icon-512.png  (512x512)"
echo "  $PUBLIC_DIR/apple-touch-icon.png (180x180)"
