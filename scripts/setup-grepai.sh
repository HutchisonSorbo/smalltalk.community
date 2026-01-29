#!/bin/bash

# setup-grepai.sh
# Installs GrepAI binary locally to ./bin/

set -e

INSTALL_DIR="./bin"
BINARY_NAME="grepai"
FULL_PATH="$INSTALL_DIR/$BINARY_NAME"

echo "Installing GrepAI to $INSTALL_DIR..."

# Create bin directory if it doesn't exist
mkdir -p "$INSTALL_DIR"

# Download the installation script and pipe to bash
# GrepAI official install script supports specifying specific install locations if handled manually,
# but the standard curl | bash installs to /usr/local/bin or $HOME/.local/bin.
# For local project installation, we'll try to download the binary directly if possible, 
# or use the installer with a custom prefix if supported.

# Based on docs: curl -fsSL https://raw.githubusercontent.com/yoanbernabeu/grepai/main/scripts/install.sh | bash
# We will inspect this, but for now, let's assume we can just run the installer and let the user decide 
# OR we can just try to run the installer.

# Note: Since we want to be safe and "project local", let's try to fetch the release directly if we can default to that.
# However, to replicate the user's manual experience, running the official installer is the standard way.

echo "Downloading binary directly to avoid sudo..."
DOWNLOAD_URL="https://github.com/yoanbernabeu/grepai/releases/download/v0.24.1/grepai_0.24.1_linux_amd64.tar.gz"

curl -L -o grepai.tar.gz "$DOWNLOAD_URL"
tar -xzf grepai.tar.gz
mv grepai "$INSTALL_DIR/"
rm grepai.tar.gz
chmod +x "$FULL_PATH"

# Check if installed
if [ -f "$FULL_PATH" ]; then
    echo "GrepAI installed successfully to $FULL_PATH"
    "$FULL_PATH" --version
else
    echo "Installation failed."
    exit 1
fi

echo "Done."
