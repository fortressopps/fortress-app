#!/bin/bash
set -e

echo "🔧 Applying v7.21 FIX patch..."

# Fix wrong filename
if [ -f backend/src/main.server.ts.ts ]; then
  mv backend/src/main.server.ts.ts backend/src/main.server.ts
  echo "✔ Renamed main.server.ts.ts -> main.server.ts"
fi

# Fix broken imports
grep -R "main.server.ts.ts" -n backend/src | cut -d: -f1 | while read f; do
  sed -i 's/main.server.ts.ts/main.server.ts/g' "$f"
  echo "✔ Fixed import in: $f"
done

# Ensure dev script targets correct entrypoint
sed -i 's/main.server.ts.ts/main.server.ts/g' backend/package.json

echo "✔ DEV script patched"
echo "🎉 Patch v7.21 FIX applied successfully!"
