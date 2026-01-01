# Laravel PWA - React + Inertia.js

Progressive Web Application (PWA) menggunakan Laravel, React, dan Inertia.js yang dapat diinstall di perangkat Android dan iOS.

## 🚀 Fitur

- ✅ Laravel 11 dengan Breeze Authentication
- ✅ React + Inertia.js untuk frontend
- ✅ PWA Support (dapat diinstall di mobile)
- ✅ Offline Support dengan Service Worker
- ✅ Optimized untuk Android & iOS
- ✅ Network access untuk testing di perangkat lain

## 🎯 Cara Menjalankan

### Menggunakan Script (Recommended)

```bash
./start-server.sh
```

Script ini akan:
- Mendeteksi IP address lokal secara otomatis
- Mengupdate konfigurasi APP_URL di .env
- Menampilkan URL untuk akses dari perangkat lain
- Menjalankan Laravel development server

## 📱 Install PWA di Mobile

### Android (Chrome)

1. Buka Chrome di perangkat Android
2. Akses `http://[IP_ADDRESS]:8000`
3. Tap menu (3 titik) > **"Install app"**
4. App akan muncul di home screen

### iOS (Safari)

1. Buka Safari di perangkat iOS
2. Akses `http://[IP_ADDRESS]:8000`
3. Tap **Share** > **"Add to Home Screen"**
4. App akan muncul di home screen

## 🌐 Akses dari Jaringan Lokal

Pastikan perangkat terhubung ke **WiFi yang sama**, lalu akses:
```
http://[IP_ADDRESS]:8000
```

**Catatan:** Ganti `[IP_ADDRESS]` dengan IP yang ditampilkan saat menjalankan `start-server.sh`

## 🔧 Development

### Build Assets

```bash
npm run build
```

### Watch Mode

```bash
npm run dev
```

## 🎨 Kustomisasi PWA

### Mengubah Nama & Icon

- **Nama:** Edit `public/manifest.json`
- **Icon:** Ganti file di `public/icons/`
- **Theme:** Edit `theme_color` di `public/manifest.json`

## 🐛 Troubleshooting

### Tidak bisa akses dari perangkat lain

1. Cek firewall (pastikan port 8000 diizinkan)
2. Pastikan semua perangkat di WiFi yang sama
3. Jangan gunakan VPN

### PWA tidak muncul opsi "Install"

- **Android:** Harus pakai Chrome
- **iOS:** Harus pakai Safari, install manual via Share button

---

## About Laravel

Laravel is a web application framework with expressive, elegant syntax. We believe development must be an enjoyable and creative experience to be truly fulfilling. Laravel takes the pain out of development by easing common tasks used in many web projects.

## License

The Laravel framework is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
