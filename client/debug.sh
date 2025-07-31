#!/bin/bash
echo "=== DEBUGGING PATH RESOLUTION ==="
echo "Project root: $(pwd)"
echo "Listing src/components:"
ls -la src/components | grep -i errorboundary
echo ""
echo "Checking ErrorBoundary.tsx existence:"
find . -name ErrorBoundary.tsx
echo ""
echo "=== RUNNING BUILD ==="
vite build
