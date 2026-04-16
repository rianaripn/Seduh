# Seduh ☕

Aplikasi pemesanan menu berbasis web untuk kedai kopi. Dirancang untuk digunakan langsung oleh pelanggan melalui tablet atau perangkat di setiap meja.

---

## Fitur

- **Tampilan menu dinamis** — menu dirender dari data JavaScript, lengkap dengan emoji, nama, deskripsi, dan harga
- **Filter kategori** — Coffee, Non-Coffee, Snack, Dessert
- **Keranjang belanja** — tambah, kurangi, atau hapus item; dilengkapi badge qty pada menu
- **Cart bar** — muncul otomatis di bagian bawah layar saat ada item di keranjang
- **Catatan pesanan** — pelanggan bisa menambahkan instruksi khusus (misal: less sugar, no ice)
- **Modal konfirmasi** — ringkasan pesanan sebelum dikirim ke kasir
- **Metode pembayaran** — pilih QRIS atau Cash
- **QR Code dummy** — muncul otomatis saat memilih QRIS, tombol konfirmasi aktif setelah 3 detik (simulasi pembayaran)
- **Toast notification** — feedback visual untuk setiap aksi pengguna
- **Tanggal dinamis** — menampilkan hari dan tanggal hari ini secara otomatis
- **Nomor meja dinamis** — dibaca dari URL query parameter

---

## Struktur File

```
Seduh/
├── index.html        # Struktur UI utama
├── style.css         # Seluruh styling aplikasi
├── script.js         # Logika aplikasi (ES6 module)
└── data/
    └── menu.js       # Data menu (nama, deskripsi, harga, kategori, emoji)
```

---

## Cara Menjalankan

Karena project menggunakan **ES6 modules** (`import/export`), file tidak bisa dibuka langsung dengan double-click. Gunakan salah satu cara berikut:

**Opsi 1 — VS Code Live Server (direkomendasikan)**
1. Install ekstensi [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) di VS Code
2. Klik kanan `index.html` → **Open with Live Server**

**Opsi 2 — Ekstensi browser**
Gunakan ekstensi seperti [Web Server for Chrome](https://chrome.google.com/webstore/detail/web-server-for-chrome)

---

## Nomor Meja Dinamis

Nomor meja dibaca otomatis dari URL. Tambahkan query parameter `?meja=X` saat membuka halaman:

```
http://localhost:5500/index.html?meja=1   →  Meja 1
http://localhost:5500/index.html?meja=3   →  Meja 3
http://localhost:5500/index.html?meja=5   →  Meja 5
```

Jika tidak ada parameter, default ke **Meja 1**.

Di dunia nyata, tiap meja cukup diberikan URL atau QR code masing-masing — satu file HTML melayani semua meja.

---

## Tech Stack

| Teknologi | Kegunaan |
|---|---|
| HTML5 | Struktur halaman |
| CSS3 | Styling & animasi |
| JavaScript (ES6) | Logika aplikasi |
| Google Fonts | Font Fraunces & Plus Jakarta Sans |
| [QR Server API](https://goqr.me/api/) | Generate QR Code dummy untuk QRIS |

Tidak menggunakan framework atau library eksternal — murni vanilla HTML/CSS/JS.

---

## Cara Menambah Menu

Buka [data/menu.js](data/menu.js) dan tambahkan objek baru ke dalam array `dataMenu`:

```js
{
    nama: 'Nama Menu',
    deskripsi: 'Deskripsi singkat bahan-bahan',
    harga: 25000,
    emoji: '☕',
    kategori: 'coffee'  // coffee | non-coffee | snack | dessert
}
```

---

## Pengembangan Selanjutnya

- Integrasi backend untuk menyimpan pesanan ke database
- Dashboard admin untuk manajemen menu secara real-time
- Notifikasi pesanan masuk untuk kasir/dapur
- Riwayat transaksi per meja
