#!/bin/bash

# Laravel PWA Development Server Starter
# Script untuk menjalankan Laravel server dengan akses jaringan lokal

echo "======================================"
echo "  Laravel PWA Development Server"
echo "======================================"
echo ""

# Deteksi IP address lokal
echo "🔍 Mendeteksi IP address lokal..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    LOCAL_IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null)
else
    # Linux
    LOCAL_IP=$(hostname -I | awk '{print $1}')
fi

if [ -z "$LOCAL_IP" ]; then
    echo "⚠️  Tidak dapat mendeteksi IP address lokal"
    echo "    Menggunakan 0.0.0.0 sebagai fallback"
    LOCAL_IP="0.0.0.0"
else
    echo "✅ IP Address lokal: $LOCAL_IP"
fi

echo ""
echo "======================================"
echo "  Akses dari perangkat lain:"
echo "======================================"
echo ""
echo "  🌐 Browser Desktop/Laptop:"
echo "     http://$LOCAL_IP:8000"
echo ""
echo "  📱 Mobile (Android/iOS):"
echo "     http://$LOCAL_IP:8000"
echo ""
echo "  💡 Tips:"
echo "     - Pastikan perangkat terhubung ke WiFi yang sama"
echo "     - Untuk install PWA di Android: Chrome > Menu > Install app"
echo "     - Untuk install PWA di iOS: Safari > Share > Add to Home Screen"
echo ""
echo "======================================"
echo ""

# Update .env dengan APP_URL yang benar
if [ -f .env ]; then
    # Backup .env
    cp .env .env.backup
    
    # Update APP_URL
    if grep -q "^APP_URL=" .env; then
        sed -i.bak "s|^APP_URL=.*|APP_URL=http://$LOCAL_IP:8000|" .env
        rm -f .env.bak
        echo "✅ APP_URL updated di .env"
    else
        echo "APP_URL=http://$LOCAL_IP:8000" >> .env
        echo "✅ APP_URL ditambahkan ke .env"
    fi
    echo ""
fi

# Start Laravel server
echo "🚀 Starting Laravel development server..."
echo ""
echo "   Tekan Ctrl+C untuk stop server"
echo ""
echo "======================================"
echo ""

php artisan serve --host=0.0.0.0 --port=8000
