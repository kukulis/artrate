#!/usr/bin/env sh
set -e  # Exit on any error

echo "=== Starting Backend Development ==="

# Only install if node_modules missing or package.json changed
if [ ! -d "node_modules" ] || [ package.json -nt node_modules ]; then
  echo "Installing dependencies..."
  npm install
else
  echo "Dependencies already installed, skipping..."
fi

# Run development server (ts-node handles TypeScript)
echo "Starting development server..."
exec npm run dev
