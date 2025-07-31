#!/bin/bash
echo "=== PATH DEBUGGING ==="
echo "Project root: $(pwd)"
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"
echo ""

echo "Listing src/components:"
ls -la src/components | grep -i ErrorBoundary
echo ""

echo "Checking file existence:"
[ -f "src/components/ErrorBoundary.tsx" ] && echo "ErrorBoundary.tsx FOUND" || echo "ErrorBoundary.tsx MISSING"
echo ""

echo "Running build..."
vite build
