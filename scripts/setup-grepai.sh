#!/bin/bash

# setup-grepai.sh
# Installs GrepAI binary locally to ./bin/
# Strictly adheres to smalltalk.community development standards.

set -euo pipefail

VERSION="0.24.1"
INSTALL_DIR="./bin"
BINARY_NAME="grepai"
FULL_PATH="$INSTALL_DIR/$BINARY_NAME"

echo "Initialising GrepAI installation to $INSTALL_DIR..."

# Create bin directory if it doesn't exist
mkdir -p "$INSTALL_DIR"

# Detect OS and Architecture
OS="$(uname -s | tr '[:upper:]' '[:lower:]')"
ARCH="$(uname -m)"

case "$ARCH" in
    x86_64) ARCH="amd64" ;;
    arm64|aarch64) ARCH="arm64" ;;
    *) echo "Error: Unsupported architecture: $ARCH"; exit 1 ;;
esac

case "$OS" in
    linux*) OS="linux" ;;
    darwin*) OS="darwin" ;;
    msys*|mingw*|cygwin*) 
        OS="windows"
        BINARY_NAME="grepai.exe"
        FULL_PATH="$INSTALL_DIR/$BINARY_NAME"
        ;;
    *) echo "Error: Unsupported operating system: $OS"; exit 1 ;;
esac

# Build asset name and download URL
if [ "$OS" = "windows" ]; then
    ASSET="grepai_${VERSION}_${OS}_${ARCH}.zip"
    EXT="zip"
else
    ASSET="grepai_${VERSION}_${OS}_${ARCH}.tar.gz"
    EXT="tar.gz"
fi

DOWNLOAD_URL="https://github.com/yoanbernabeu/grepai/releases/download/v${VERSION}/${ASSET}"

echo "Downloading $ASSET for $OS/$ARCH..."

# Create a temporary directory for extraction to avoid repository pollution
TMP_DIR="$(mktemp -d)"
# Ensure cleanup on exit
trap 'rm -rf "$TMP_DIR"' EXIT

# Download and extract
if [ "$EXT" = "zip" ]; then
    if ! command -v unzip &> /dev/null; then
        echo "Error: unzip is required for Windows installation."
        exit 1
    fi
    curl -fsSL "$DOWNLOAD_URL" -o "$TMP_DIR/grepai.zip"
    unzip -q "$TMP_DIR/grepai.zip" -d "$TMP_DIR"
else
    curl -fsSL "$DOWNLOAD_URL" -o "$TMP_DIR/grepai.tar.gz"
    tar -xzf "$TMP_DIR/grepai.tar.gz" -C "$TMP_DIR"
fi

# Move the binary to the install directory
if [ -f "$TMP_DIR/$BINARY_NAME" ]; then
    mv "$TMP_DIR/$BINARY_NAME" "$INSTALL_DIR/"
    chmod +x "$FULL_PATH"
else
    # Some archives might have a nested folder, though GrepAI usually doesn't.
    # We search for the binary specifically.
    FOUND_BIN=$(find "$TMP_DIR" -type f -name "$BINARY_NAME" | head -n 1)
    if [ -n "$FOUND_BIN" ]; then
        mv "$FOUND_BIN" "$INSTALL_DIR/"
        chmod +x "$FULL_PATH"
    else
        echo "Error: Could not find binary $BINARY_NAME in the downloaded archive."
        exit 1
    fi
fi

# Check if installed successfully
if [ -f "$FULL_PATH" ]; then
    echo "✅ GrepAI installed successfully to $FULL_PATH"
    # Execute version check
    "$FULL_PATH" version
else
    echo "Error: Installation failed."
    exit 1
fi

echo "Checking for Ollama environment..."
if ! command -v ollama &> /dev/null; then
    echo "⚠️  Ollama is not detected in your PATH."
    echo "To install (recommended): curl -fsSL https://ollama.com/install.sh | sh"
    echo "This will set up local embeddings for GrepAI."
else
    echo "✅ Ollama detected."
    
    # Guard systemctl usage for non-systemd environments (macOS, WSL1, etc.)
    HAS_SYSTEMCTL=false
    if command -v systemctl &> /dev/null; then
        HAS_SYSTEMCTL=true
    fi

    if [ "$HAS_SYSTEMCTL" = true ]; then
        if systemctl is-active --quiet ollama; then
             echo "✅ Ollama service is running."
             echo "Checking for embedding model (nomic-embed-text)..."
             if ! ollama list | grep -q "nomic-embed-text"; then
                 echo "⚠️  Embedding model missing. Pulling now..."
                 ollama pull nomic-embed-text
             else
                 echo "✅ Embedding model ready."
             fi
        else
             echo "⚠️  Ollama service is NOT running via systemd."
             echo "Start it with: sudo systemctl start ollama"
        fi
    else
        echo "ℹ️  systemctl not available; assuming Ollama is managed manually."
        echo "Verifying Ollama connectivity..."
        if ollama list &> /dev/null; then
            echo "✅ Ollama is responding."
            if ! ollama list | grep -q "nomic-embed-text"; then
                echo "⚠️  Embedding model missing. Pulling now..."
                ollama pull nomic-embed-text
            else
                echo "✅ Embedding model ready."
            fi
        else
            echo "⚠️  Ollama is installed but not responding. Please ensure the Ollama app or server is running."
        fi
    fi
fi

echo "Installation process complete."