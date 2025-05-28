#!/bin/bash

# ============================================================
# PANDUAN SETUP UPLOADTHING UNTUK TOKO OLEH-OLEH
# ============================================================

echo "🚀 PANDUAN SETUP UPLOADTHING"
echo "============================================================"
echo ""

echo "📝 LANGKAH 1: DAPATKAN CREDENTIALS UPLOADTHING"
echo "-----------------------------------------------------------"
echo "1. Buka browser dan kunjungi: https://uploadthing.com"
echo "2. Login atau daftar akun baru"
echo "3. Buat aplikasi baru atau gunakan yang ada"
echo "4. Di dashboard, catat credentials berikut:"
echo "   ✅ UPLOADTHING_SECRET (mulai dengan sk_live_...)"
echo "   ✅ UPLOADTHING_APP_ID (contoh: abc123def)"
echo "   ✅ UPLOADTHING_TOKEN (token API)"
echo ""

echo "🌐 LANGKAH 2: SET ENVIRONMENT VARIABLES DI RAILWAY"
echo "-----------------------------------------------------------"
echo "Jalankan perintah berikut setelah mendapat credentials:"
echo ""
echo "railway variables --set UPLOADTHING_SECRET='sk_live_your_secret_here'"
echo "railway variables --set UPLOADTHING_APP_ID='your_app_id_here'"
echo "railway variables --set UPLOADTHING_TOKEN='your_token_here'"
echo ""

echo "🔄 LANGKAH 3: REDEPLOY APLIKASI"
echo "-----------------------------------------------------------"
echo "Setelah set environment variables:"
echo "railway redeploy"
echo ""

echo "✅ LANGKAH 4: VERIFIKASI"
echo "-----------------------------------------------------------"
echo "1. Login ke admin panel: https://toko-oleh-oleh-production.up.railway.app/admin"
echo "2. Coba upload gambar produk/kategori baru"
echo "3. Pastikan URL gambar menggunakan 'utfs.io' (UploadThing)"
echo ""

echo "🔧 LANGKAH 5: MIGRATE GAMBAR EXISTING (OPSIONAL)"
echo "-----------------------------------------------------------"
echo "Untuk mengganti placeholder Unsplash dengan gambar asli:"
echo "1. Upload gambar asli melalui admin panel"
echo "2. Gambar akan otomatis tersimpan di cloud"
echo "3. Hapus placeholder yang tidak diperlukan"
echo ""

echo "📋 CATATAN PENTING:"
echo "-----------------------------------------------------------"
echo "• Kode UploadThing sudah siap di aplikasi Anda"
echo "• Yang kurang hanya environment variables"
echo "• Setelah setup, upload akan otomatis ke cloud"
echo "• File akan persist meskipun Railway redeploy"
echo ""

echo "🆘 JIKA BUTUH BANTUAN:"
echo "-----------------------------------------------------------"
echo "• UploadThing Docs: https://docs.uploadthing.com"
echo "• Support: https://uploadthing.com/support"
echo ""

echo "============================================================"
echo "🎯 SETELAH SETUP, GAMBAR AKAN TERSIMPAN PERMANENT DI CLOUD!"
echo "============================================================"
