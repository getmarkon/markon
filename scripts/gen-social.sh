#!/bin/bash

W=1280 H=640 BG="transparent" SCALE=82 X=50 Y=30 STACK=25 LOGO_SIZE=200 RADIUS=20
THEME="${1:-'tokyo-night'}"
URL="http://localhost:5173?theme=${THEME}&mode"
OUT="public/screenshots-${THEME}.png"

cd "$(dirname "$0")/.."

curl -s $URL=light >/dev/null || {
  echo "❌ Dev server not running"
  exit 1
}
command -v magick >/dev/null || {
  echo "❌ ImageMagick not found"
  exit 1
}

function mkround {
  local r="$RADIUS"
  magick "${1:?MISS}" \
    \( +clone -alpha extract \
    -draw "fill black polygon 0,0 0,$r $r,0 fill white circle $r,$r $r,0" \
    \( +clone -flip \) -compose Multiply -composite \
    \( +clone -flop \) -compose Multiply -composite \
    \) -alpha off -compose CopyOpacity -composite "${1:?MISS}"
}

echo "📸 Capturing screenshots..."
for mode in light dark; do
  f="screenshot-$mode.png"
  chromium \
    --headless --disable-gpu \
    --virtual-time-budget=2000 \
    --hide-scrollbars \
    --window-size=1200,650 \
    --screenshot=$f \
    "$URL=$mode" 2>/dev/null
  magick "$f" -trim +repage "$f"
  mkround "$f"
done

WIDTH=$((1200 * SCALE / 100))
HEIGHT=$((650 * SCALE / 100))
DARK_X=$((W - WIDTH - X))
DARK_Y=$((Y + HEIGHT * STACK / 100))

echo "🎨 Creating composite..."
magick -size ${W}x${H} xc:"${BG}" \
  \( screenshot-light.png -resize ${WIDTH}x${HEIGHT} \) -geometry +${X}+${Y} -composite \
  \( screenshot-dark.png -resize ${WIDTH}x${HEIGHT} \) -geometry +${DARK_X}+${DARK_Y} -composite \
  \( public/logo.png -resize ${LOGO_SIZE}x${LOGO_SIZE} \) -geometry +$((X + 120))+$((H - LOGO_SIZE - Y + 10)) -composite \
  "${OUT}"

echo "🗜️ Optimizing final image..."

magick "${OUT}" \
  -strip \
  -define png:compression-level=9 \
  -define png:compression-strategy=2 \
  "${OUT}"

command -v pngquant >/dev/null && {
  echo "🔧 Further optimizing with pngquant..."
  pngquant --force --ext .png --quality=70-85 "${OUT}"
}

rm -f screenshot-*.png
echo "✅ Generated: ${OUT} (${W}x${H})"
