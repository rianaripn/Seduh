const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = 5000;

// ==========================================
// 1. MIDDLEWARE 
// ==========================================
app.use(cors());
app.use(express.json());


// -- KONEKSI DATABASE -- //

const db = new sqlite3.Database('./database/seduh.db', (err) => {
    if (err) {
        console.error('❌ Gagal Koneksi ke database: ', err.message)
    } else {
        console.log('✅ Terhubung ke database SQLite.');
    }
})

// -- TABEL DATABASE -- //
db.run(`
    CREATE TABLE IF NOT EXISTS pesanan (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        id_struk TEXT NOT NULL,
        identifier_pelanggan TEXT NOT NULL,
        metode_pembayaran TEXT NOT NULL,
        total_harga INTEGER NOT NULL,
        items TEXT NOT NULL,
        waktu TEXT NOT NULL
    )
    `, (err) => {
    if (err) {
        console.error('❌ Gagal membuat tabel:', err.message)
    } else {
        console.log('✅ Tabel "pesanan" siap digunakan.')
    }
});

// --- SIMULASI DATABASE MENU ---

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

// const daftarPesanan = []

// --- ROUTE / ENDPOINT UNTUK MENGAMBIL MENU ---
app.get('/api/menu', (req, res) => {
    res.json(daftarMenu);
});

// ==========================================
// 2. ROUTING / LOKET PELAYANAN
// ==========================================
app.get('/', (req, res) => {
    res.send('Server Seduh berjalan lancar di Port 5000!');
});

app.get('/api/pesanan', (req, res) => {
    db.all('SELECT * FROM pesanan ORDER BY id DESC', (err, rows) => {
        if (err) {
            res.status(500).json({
                status: 'gagal',
                pesan: 'Gagal mengambil data.'
            })
            return
        }
        const hasil = rows.map(row => ({
            ...row,
            items: JSON.parse(row.items)
        }))
        res.json(hasil)
    })
})

app.post('/api/pesanan', (req, res) => {
    const dataPesanan = req.body;

    // VALIDASI DATA PESANAN 
    if (!dataPesanan.items || dataPesanan.items.length === 0) {
        res.status(400).json({
            status: 'gagal',
            pesan: 'Keranjang tidak boleh kosong!'
        })
        return;
    }
    if (dataPesanan.metode_pembayaran !== 'qris' && dataPesanan.metode_pembayaran !== 'cash') {
        res.status(400).json({
            status: 'gagal',
            pesan: 'Pilih metode pembayaran yang valid!'
        })
        return
    }
    if (dataPesanan.total_harga <= 0) {
        res.status(400).json({
            status: 'gagal',
            pesan: 'Total harga tidak valid!'
        })
        return
    }
    if (!dataPesanan.identifier_pelanggan || dataPesanan.identifier_pelanggan <= 0) {
        res.status(400).json({
            status: 'gagal',
            pesan: 'Nomor meja tidak valid!'
        })
        return
    }
    for (const item of dataPesanan.items) {
        if (!item.nama || item.nama.trim() === '') {
            res.status(400).json({
                status: 'gagal',
                pesan: 'Nama item tidak boleh kosong!'
            })
            return;
        }
        if (!item.harga || item.harga <= 0) {
            res.status(400).json({
                status: 'gagal',
                pesan: 'Harga item tidak valid!'
            })
            return;
        }
        if (!item.qty || item.qty <= 0) {
            res.status(400).json({
                status: 'gagal',
                pesan: 'Jumlah item tidak valid!'
            })
            return;
        }
    }

    const id_struk = 'ORD-' + Math.floor(Math.random() * 1000);
    const waktu = new Date().toDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    })

    // -- ITEM PESANAN KERANJANG -- //
    const itemJSON = JSON.stringify(dataPesanan.items)

    db.run(
        `INSERT INTO pesanan (id_struk, identifier_pelanggan, metode_pembayaran, total_harga, items, waktu)
        VALUES (?,?,?,?,?,?)
        `, [id_struk, dataPesanan.identifier_pelanggan, dataPesanan.metode_pembayaran, dataPesanan.total_harga, itemJSON, waktu],
        function (err) {
            if (err) {
                console.error('❌ Gagal menyimpan pesanan: ', err.message);
                res.status(500).json({
                    status: 'gagal',
                    pesan: 'Gagal menyimpan pesanan ke database.'
                })
                return
            }
        }
    )

    // daftarPesanan.push(pesananBaru)
    console.log('\n===================================');
    console.log('📥 PESANAN BARU MASUK!');
    console.log('ID Struk :', id_struk)
    console.log('Meja/Pelanggan:', dataPesanan.identifier_pelanggan);
    console.log('Metode Pembayaran:', dataPesanan.metode_pembayaran);
    console.log('Total Harga: Rp', dataPesanan.total_harga.toLocaleString('id-ID'));
    console.log('Daftar Item:')
    dataPesanan.items.forEach(function (item) {
        console.log(`- ${item.nama} (${item.qty} x Rp ${item.harga.toLocaleString('id-ID')})`)
    })

    console.log('===================================\n');

    res.status(201).json({
        status: 'berhasil',
        pesan: 'Pesanan Anda sedang disiapkan oleh barista!',
        id_struk: id_struk
    });
});

// ==========================================
// 3. MENYALAKAN SERVER
// ==========================================
app.listen(PORT, () => {
    console.log(`✅ Mesin Kasir/Server berjalan di http://localhost:${PORT}`);
});