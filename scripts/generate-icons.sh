#!/bin/bash

# Generate macOS app icon from SVG

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
ASSETS_DIR="$PROJECT_DIR/assets"
ICONSET_DIR="$ASSETS_DIR/icon.iconset"

# Create iconset directory
rm -rf "$ICONSET_DIR"
mkdir -p "$ICONSET_DIR"

echo "Generating icon sizes..."

# Generate all required icon sizes
# macOS requires both regular and @2x versions
convert -background none -resize 16x16 "$ASSETS_DIR/icon.svg" "$ICONSET_DIR/icon_16x16.png"
convert -background none -resize 32x32 "$ASSETS_DIR/icon.svg" "$ICONSET_DIR/icon_16x16@2x.png"
convert -background none -resize 32x32 "$ASSETS_DIR/icon.svg" "$ICONSET_DIR/icon_32x32.png"
convert -background none -resize 64x64 "$ASSETS_DIR/icon.svg" "$ICONSET_DIR/icon_32x32@2x.png"
convert -background none -resize 128x128 "$ASSETS_DIR/icon.svg" "$ICONSET_DIR/icon_128x128.png"
convert -background none -resize 256x256 "$ASSETS_DIR/icon.svg" "$ICONSET_DIR/icon_128x128@2x.png"
convert -background none -resize 256x256 "$ASSETS_DIR/icon.svg" "$ICONSET_DIR/icon_256x256.png"
convert -background none -resize 512x512 "$ASSETS_DIR/icon.svg" "$ICONSET_DIR/icon_256x256@2x.png"
convert -background none -resize 512x512 "$ASSETS_DIR/icon.svg" "$ICONSET_DIR/icon_512x512.png"
convert -background none -resize 1024x1024 "$ASSETS_DIR/icon.svg" "$ICONSET_DIR/icon_512x512@2x.png"

echo "Creating .icns file..."

# Create icns file
iconutil -c icns "$ICONSET_DIR" -o "$ASSETS_DIR/icon.icns"

# Clean up iconset folder
rm -rf "$ICONSET_DIR"

# Also create a PNG for other platforms
convert -background none -resize 512x512 "$ASSETS_DIR/icon.svg" "$ASSETS_DIR/icon.png"

echo "✓ Icons generated successfully!"
echo "  - $ASSETS_DIR/icon.icns (macOS)"
echo "  - $ASSETS_DIR/icon.png (other platforms)"
