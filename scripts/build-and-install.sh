#!/bin/bash

# Build and install Home app to macOS Applications folder

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
APP_NAME="Home"

cd "$PROJECT_DIR"

echo "🔧 Building Home app..."
echo ""

# Generate icons if they don't exist
if [ ! -f "$PROJECT_DIR/assets/icon.icns" ]; then
    echo "📦 Generating app icons..."
    bash "$SCRIPT_DIR/generate-icons.sh"
    echo ""
fi

# Build the app
echo "📦 Packaging app with Electron Forge..."
npm run make -- --platform=darwin --arch=arm64,x64

echo ""
echo "🚀 Installing to Applications..."

# Find the built app
OUT_DIR="$PROJECT_DIR/out"
APP_PATH=""

# Look for the .app in the make output
for dir in "$OUT_DIR"/make/zip/darwin/*; do
    if [ -d "$dir" ]; then
        # Unzip to get the .app
        TEMP_DIR=$(mktemp -d)
        unzip -q "$dir"/*.zip -d "$TEMP_DIR"
        APP_PATH="$TEMP_DIR/$APP_NAME.app"
        if [ ! -d "$APP_PATH" ]; then
            # Try with the product name from package.json
            APP_PATH="$TEMP_DIR/home.app"
        fi
        break
    fi
done

# Alternative: look directly in the out folder
if [ ! -d "$APP_PATH" ]; then
    for app in "$OUT_DIR"/*darwin*/*.app; do
        if [ -d "$app" ]; then
            APP_PATH="$app"
            break
        fi
    done
fi

if [ ! -d "$APP_PATH" ]; then
    echo "❌ Could not find built .app file"
    echo "   Looking in: $OUT_DIR"
    ls -la "$OUT_DIR" 2>/dev/null || true
    exit 1
fi

echo "   Found: $APP_PATH"

# Remove old installation if exists
if [ -d "/Applications/$APP_NAME.app" ]; then
    echo "   Removing old installation..."
    rm -rf "/Applications/$APP_NAME.app"
fi

# Copy to Applications
echo "   Copying to /Applications..."
cp -R "$APP_PATH" "/Applications/"

# Clean up temp dir if used
if [ -n "$TEMP_DIR" ]; then
    rm -rf "$TEMP_DIR"
fi

echo ""
echo "✅ $APP_NAME has been installed to /Applications"
echo ""
echo "   To run: open /Applications/$APP_NAME.app"
echo "   Or find it in Launchpad/Spotlight"
