const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000; // Kita ganti ke port 5000 agar tidak bentrok!

// ==========================================
// 1. MIDDLEWARE (WAJIB DI ATAS)
// ==========================================
app.use(cors()); // Ini satpam yang mengizinkan request dari browser
app.use(express.json()); // Ini penerjemah teks JSON


// --- SIMULASI DATABASE MENU ---
// Anda bisa menyalin isi lengkap dari file data/menu.js asli Anda ke dalam sini
const daftarMenu = [
    {
        nama: 'Seduh Signature',
        deskripsi: 'Espresso, oat milk, brown sugar',
        harga: 32000,
        emoji: '☕',
        kategori: 'coffee'
    },
    {
        nama: 'Kopi Aren Susu',
        deskripsi: 'Espresso, susu segar, gula aren asli',
        harga: 28000,
        emoji: '🧋',
        kategori: 'coffee'
    },
    {
        nama: 'Es Kopi Garam',
        deskripsi: 'Cold brew, susu, sejumput garam himalaya',
        harga: 30000,
        emoji: '🥤',
        kategori: 'coffee'
    },
    {
        nama: 'Americano Panas',
        deskripsi: 'Double shot espresso, air panas',
        harga: 22000,
        emoji: '☕',
        kategori: 'coffee'
    },
    {
        nama: 'Dirty Matcha',
        deskripsi: 'Espresso shot di atas matcha latte',
        harga: 35000,
        emoji: '🍵',
        kategori: 'coffee'
    },

    // NON-COFFEE
    {
        nama: 'Matcha Latte',
        deskripsi: 'Matcha premium Uji, susu segar',
        harga: 28000,
        emoji: '🍵',
        kategori: 'non-coffee'
    },
    {
        nama: 'Coklat Seduh',
        deskripsi: 'Dark chocolate 70%, susu oat, madu',
        harga: 30000,
        emoji: '🍫',
        kategori: 'non-coffee'
    },
    {
        nama: 'Teh Tarik Susu',
        deskripsi: 'Teh Ceylon, susu kental, kayu manis',
        harga: 22000,
        emoji: '🫖',
        kategori: 'non-coffee'
    },
    {
        nama: 'Lemon Sereh',
        deskripsi: 'Lemon segar, sereh, madu, soda',
        harga: 25000,
        emoji: '🍋',
        kategori: 'non-coffee'
    },

    // SNACK
    {
        nama: 'Croissant Mentega',
        deskripsi: 'Croissant fresh, mentega Prancis',
        harga: 18000,
        emoji: '🥐',
        kategori: 'snack'
    },
    {
        nama: 'Roti Bakar Seduh',
        deskripsi: 'Roti sourdough, selai kacang, pisang',
        harga: 20000,
        emoji: '🍞',
        kategori: 'snack'
    },
    {
        nama: 'Banana Bread',
        deskripsi: 'Homemade, pisang cavendish, walnut',
        harga: 22000,
        emoji: '🍌',
        kategori: 'snack'
    },

    // DESSERT
    {
        nama: 'Basque Cheesecake',
        deskripsi: 'Creamy, burnt top, cream cheese premium',
        harga: 28000,
        emoji: '🍰',
        kategori: 'dessert'
    },
    {
        nama: 'Tiramisu Seduh',
        deskripsi: 'Ladyfinger, mascarpone, espresso shot',
        harga: 32000,
        emoji: '🍮',
        kategori: 'dessert'
    },
    {
        nama: 'Panna Cotta Aren',
        deskripsi: 'Susu, gelatin, siraman gula aren',
        harga: 25000,
        emoji: '🍯',
        kategori: 'dessert'
    }

];

// --- ROUTE / ENDPOINT UNTUK MENGAMBIL MENU ---
app.get('/api/menu', (req, res) => {
    // Saat ada pelanggan/aplikasi yang meminta data ke loket ini,
    // server langsung memberikan daftarMenu dalam format JSON
    res.json(daftarMenu);
});


// ==========================================
// 2. ROUTING / LOKET PELAYANAN
// ==========================================
app.get('/', (req, res) => {
    res.send('Server Seduh berjalan lancar di Port 5000!');
});

app.post('/api/pesanan', (req, res) => {
    const dataPesanan = req.body;

    console.log('\n===================================');
    console.log('📥 PESANAN BARU MASUK!');
    console.log('Meja/Pelanggan:', dataPesanan.identifier_pelanggan);
    console.log('Metode Pembayaran:', dataPesanan.metode_pembayaran);
    console.log('Total Harga: Rp', dataPesanan.total_harga);
    console.log('Daftar Item:', dataPesanan.items);
    console.log('===================================\n');

    res.json({
        status: 'berhasil',
        pesan: 'Pesanan Anda sedang disiapkan oleh barista!',
        id_struk: 'ORD-' + Math.floor(Math.random() * 1000)
    });
});

// ==========================================
// 3. MENYALAKAN SERVER
// ==========================================
app.listen(PORT, () => {
    console.log(`✅ Mesin Kasir/Server berjalan di http://localhost:${PORT}`);
});