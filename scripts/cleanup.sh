#!/bin/bash

# Cleanup script untuk menghapus file-file yang tidak terpakai
# Script ini akan menghapus file testing, backup, dan cache yang tidak diperlukan

echo "🧹 Membersihkan file-file yang tidak terpakai..."

# Array file-file yang akan dihapus
FILES_TO_REMOVE=(
    "check-order.js"
    "check-traffic-data.ts"
    "middleware-backup2.js"
    "middleware-backup3.ts"
    "middleware-simple.ts"
    "middleware-test.js"
    "middleware.js"
    "test-cart.js"
    "test-traffic-api.js"
    "unused-vars.json"
    "tsconfig.tsbuildinfo"
)

# Counter untuk file yang dihapus
DELETED_COUNT=0

# Loop untuk menghapus setiap file
for file in "${FILES_TO_REMOVE[@]}"; do
    if [ -f "$file" ]; then
        echo "🗑️  Menghapus: $file"
        rm "$file"
        ((DELETED_COUNT++))
    else
        echo "⚠️  File tidak ditemukan: $file"
    fi
done

# Bersihkan cache Next.js
if [ -d ".next" ]; then
    echo "🗑️  Membersihkan cache Next.js..."
    rm -rf .next
    ((DELETED_COUNT++))
fi

# Bersihkan cache node_modules jika ada yang corrupt
echo "🔄 Membersihkan cache npm..."
npm cache clean --force

echo ""
echo "✅ Cleanup selesai!"
echo "📊 Total file/folder yang dihapus: $DELETED_COUNT"
echo ""
echo "📝 File yang dihapus:"
echo "   - File testing kosong (check-*.js, test-*.js)"
echo "   - File backup middleware (middleware-backup*.js/ts)"
echo "   - File middleware kosong (middleware.js, middleware-*.js/ts)"
echo "   - File cache TypeScript (tsconfig.tsbuildinfo)"
echo "   - File debug besar (unused-vars.json - 59MB)"
echo "   - Cache Next.js (.next folder)"
echo ""
echo "🚀 Proyek sekarang lebih bersih dan siap untuk development!"
