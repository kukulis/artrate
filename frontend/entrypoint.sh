#!/usr/bin/env sh
set -e  # Exit on any error

echo "=== Starting Frontend Development ==="

# Only install if node_modules missing or package.json changed
if [ ! -d "node_modules" ] || [ package.json -nt node_modules ]; then
  echo "Installing dependencies..."
  npm install
else
  echo "Dependencies already installed, skipping..."
fi

# Run Vite development server
echo "Starting Vite server..."
exec npm run dev
