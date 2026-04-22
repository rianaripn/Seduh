require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const PDFDocument = require('pdfkit');

const app = express();
const PORT = process.env.PORT || 5000;

// ==========================================
// 1. MIDDLEWARE 
// ==========================================
app.use(cors());
app.use(express.json());


// -- KONEKSI DATABASE -- //

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl:{
        rejectUnauthorized: false
    }
})

// -- TABEL DATABASE -- //
pool.query(`
    CREATE TABLE IF NOT EXISTS pesanan (
        id SERIAL PRIMARY KEY,
        id_struk VARCHAR(255) NOT NULL,
        identifier_pelanggan VARCHAR(255) NOT NULL,
        metode_pembayaran VARCHAR(50) NOT NULL,
        total_harga INTEGER NOT NULL,
        items TEXT NOT NULL,
        waktu VARCHAR(255) NOT NULL
    )    
`)
    .then(() => {
        console.log("Database berhasil terhubung!")
    })
    .catch((err) => {
        console.error("Database gagal terhubung!", err.message)
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

// --- ROUTE / ENDPOINT UNTUK MENGAMBIL MENU ---
app.get('/api/menu', (req, res) => {
    res.json(daftarMenu);
});

// ==========================================
// 2. ROUTING / LOKET PELAYANAN
// ==========================================
app.get('/', (req, res) => {
    res.send('Server Seduh berjalan lancar!');
});

app.get('/api/pesanan', async (req, res) => {
    try{
        const result = await pool.query('SELECT * FROM pesanan ORDER BY id DESC');
        const hasil = result.rows.map(row => ({
            ...row,
            items:JSON.parse(row.items)
        }))
        res.json(hasil)
    } catch(err){
        console.error(err);
        res.status(500).json({
            status:'gagal',
            pesan:'Gagal mengambil data'
        })
    }
})

app.post('/api/pesanan', async (req, res) => {
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

    try{
        await pool.query(
            `INSERT INTO pesanan (id_struk,identifier_pelanggan,metode_pembayaran,total_harga,items,waktu)
            VALUES ($1,$2,$3,$4,$5,$6)`,
            [id_struk, dataPesanan.identifier_pelanggan, dataPesanan.metode_pembayaran, dataPesanan.total_harga, itemJSON, waktu]
        );
        console.log('\n📥 PESANAN BARU MASUK! ID:', id_struk);
        res.status(201).json({
            status: 'berhasil',
            pesan: 'Pesanan Anda sedang disiapkan oleh barista!',
            id_struk: id_struk
        });
    } catch(err){
        console.error('❌ Gagal menyimpan pesanan: ', err.message);
        res.status(500).json({ status: 'gagal', pesan: 'Gagal menyimpan pesanan ke database.' });
    }
    // console.log('\n===================================');
    // console.log('📥 PESANAN BARU MASUK!');
    // console.log('ID Struk :', id_struk)
    // console.log('Meja/Pelanggan:', dataPesanan.identifier_pelanggan);
    // console.log('Metode Pembayaran:', dataPesanan.metode_pembayaran);
    // console.log('Total Harga: Rp', dataPesanan.total_harga.toLocaleString('id-ID'));
    // console.log('Daftar Item:')
    // dataPesanan.items.forEach(function (item) {
    //     console.log(`- ${item.nama} (${item.qty} x Rp ${item.harga.toLocaleString('id-ID')})`)
    // })

    // console.log('===================================\n');

    // res.status(201).json({
    //     status: 'berhasil',
    //     pesan: 'Pesanan Anda sedang disiapkan oleh barista!',
    //     id_struk: id_struk
    // });
});

// ==========================================
// 3. GENERATE PDF
// ==========================================

function generateStrukPDF(pesanan, res) {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Struk-${pesanan.id_struk}.pdf"`);

    const doc = new PDFDocument({
        size: 'A6',
        margin: 15
    });

    doc.pipe(res);

    const lebarHalaman = doc.page.width - 30;
    let y = 15; // Posisi Y awal

    // ===== HEADER =====
    doc.fontSize(16).font('Helvetica-Bold').text('S E D U H', 15, y, { align: 'center' });
    y += 20;

    doc.fontSize(9).font('Helvetica').text('Jl. Kopi No. 123', 15, y, { align: 'center' });
    y += 12;

    doc.fontSize(9).text('IG: @seduhcafe', 15, y, { align: 'center' });
    y += 20;

    doc.fontSize(11).font('Helvetica-Bold').text('=== STRUK PEMBAYARAN ===', 15, y, { align: 'center' });
    y += 20;

    // ===== INFO PESANAN =====
    doc.fontSize(9).font('Helvetica');
    doc.text(`No. Pesanan  : ${pesanan.id_struk}`, 15, y);
    y += 14;
    doc.text(`Meja         : ${pesanan.identifier_pelanggan}`, 15, y);
    y += 14;
    doc.text(`Waktu        : ${pesanan.waktu}`, 15, y);
    y += 14;
    doc.text(`Metode Bayar : ${pesanan.metode_pembayaran.toUpperCase()}`, 15, y);
    y += 20;

    // ===== GARIS PEMISAH =====
    doc.moveTo(15, y).lineTo(lebarHalaman + 15, y).stroke();
    y += 15;

    // ===== HEADER TABEL =====
    doc.font('Helvetica-Bold').text('Item', 15, y);
    doc.text('Harga', lebarHalaman - 40, y);
    y += 15;
    doc.font('Helvetica');

    // ===== DAFTAR ITEM =====
    pesanan.items.forEach((item) => {
        const totalItem = item.harga * item.qty;
        const teksItem = `• ${item.nama} (x${item.qty})`;
        const teksHarga = `Rp ${totalItem.toLocaleString('id-ID')}`;

        doc.text(teksItem, 15, y);
        doc.text(teksHarga, lebarHalaman - doc.widthOfString(teksHarga) + 15, y);
        y += 14;

        // Catatan
        if (item.catatan && item.catatan.trim() !== '') {
            doc.fontSize(8).font('Helvetica-Oblique')
                .text(`   Catatan: ${item.catatan}`, 20, y);
            y += 12;
            doc.fontSize(9).font('Helvetica');
        }
    });

    y += 5;

    // ===== GARIS PEMISAH =====
    doc.moveTo(15, y).lineTo(lebarHalaman + 15, y).stroke();
    y += 15;

    // ===== TOTAL =====
    doc.font('Helvetica-Bold').fontSize(11);
    const teksTotalLabel = 'TOTAL';
    const teksTotalNilai = `Rp ${pesanan.total_harga.toLocaleString('id-ID')}`;

    doc.text(teksTotalLabel, 15, y);
    doc.text(teksTotalNilai, lebarHalaman - doc.widthOfString(teksTotalNilai) + 15, y);
    y += 25;

    // ===== FOOTER =====

    doc.fontSize(12).font('Helvetica-Bold').text('TERIMA KASIH', 15, y, { align: 'center' });
    y += 16;

    doc.fontSize(9).font('Helvetica').text('Sampai jumpa kembali', 15, y, { align: 'center' });
    y += 20;

    doc.fontSize(7).text('*** Simpan struk ini sebagai bukti pembayaran ***', 15, y, { align: 'center' });

    doc.end();
}

app.get('/api/struk/:id_struk', async (req, res) => {
    const { id_struk } = req.params;

    try {
        // Cari pesanan menggunakan PostgreSQL ($1)
        const result = await pool.query('SELECT * FROM pesanan WHERE id_struk = $1', [id_struk]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ status: 'gagal', pesan: 'Pesanan tidak ditemukan.' });
        }

        const row = result.rows[0];
        const pesanan = {
            ...row,
            items: JSON.parse(row.items)
        };

        generateStrukPDF(pesanan, res);
    } catch (err) {
        console.error('❌ Gagal mencari pesanan:', err.message);
        res.status(500).json({ status: 'gagal', pesan: 'Gagal mencari pesanan.' });
    }
});
// ==========================================
// 4. MENYALAKAN SERVER
// ==========================================
app.listen(PORT, () => {
    console.log(`✅ Mesin Kasir/Server berjalan di http://localhost:${PORT}`);
});