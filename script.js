// ============================================================
// IMPORTS & STATE
// ============================================================
// import { dataMenu } from "./data/menu.js"
// ============================================================
// FUNGSI MENGAMBIL MENU DARI SERVER
// ============================================================
const API_URL = 'https://seduh-production.up.railway.app';
let dataMenu = [];
// let keranjang = [];
async function ambilDataMenuDariServer() {
    const listProduk = document.getElementById('listProduk');
    try {
        // const respons = await fetch('http://localhost:5000/api/menu');
         
        fetch(`${API_URL}/api/menu`)

        if (!respons.ok) {
            throw new Error(`Server merespon dengan status: ${respons.status}`);
        }

        const dataDariServer = await respons.json();
        dataMenu = dataDariServer;

        renderMenu(dataMenu);
        updateMenuHighlight();
    } catch (error) {
        console.error("Kesalahan Fetch:", error);
        listProduk.innerHTML = `
            <div style="text-align:center; padding: 20px; color: #666;">
                <p><strong>Gagal memuat menu dari server.</strong></p>
                <p><small>Error: ${error.message}</small></p>
                <p style="font-size: 12px; margin-top: 10px;">Pastikan backend (Node.js) menyala di port 5000 dan jalankan project ini menggunakan Live Server.</p>
            </div>`;
    }
}


let keranjang = []

// ============================================================
// REFERENSI ELEMEN DOM
// ============================================================
const cartBar = document.querySelector('.cart-bar')
const modal = document.querySelector('.modal')
const overlay = document.querySelector('.overlay')
const cartsItems = document.querySelector('.cart-items')
const totalPembelanjaan = document.getElementById('totalPembelanjaan')
const btnCta = document.getElementById('btnCta')
const modalKonfirmasi = document.querySelector('.modal-konfirmasi')
const ringkasanOrder = document.getElementById('ringkasanOrder')
const qrContainer = document.getElementById('qrContainer')
const qrImage = document.getElementById('qrImage')
const btnKonfirmasi = document.getElementById('btnKonfirmasi')
const konfirmasiBayarContainer = document.getElementById('konfirmasiBayarContainer');
const btnSudahBayar = document.getElementById('btnSudahBayar');
let timerKonfirmasi

// ============================================================
// INISIALISASI — Tanggal & Nomor Meja
// Tanggal diambil dari Date API dan diformat ke Bahasa Indonesia.
// Nomor meja dibaca dari URL query param (?meja=X), fallback ke 1.
// ============================================================
const hariIni = new Date()
const tanggal = hariIni.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
})
const elTanggal = document.getElementById('headerSub')
elTanggal.textContent = tanggal

const params = new URLSearchParams(window.location.search)
const noMeja = params.get('meja') ?? '1'
const elMeja = document.getElementById('nomorMeja')
elMeja.textContent = 'Meja ' + noMeja

// ============================================================
// RENDER MENU
// Menerima array data menu, lalu merender setiap item ke #listProduk.
// ============================================================
function renderMenu(data) {
    const listProduk = document.getElementById('listProduk')
    listProduk.innerHTML = data.map(item => `
        <div class="menu-wrapper" data-nama="${item.nama}">
            <div class="menu-img">${item.emoji}</div>
            <div class="menu-content">
                <div class="menu-title">
                    <h3>${item.nama}</h3>
                    <p>${item.deskripsi}</p>
                </div>
                <div class="menu-action">
                    <p>Rp ${item.harga.toLocaleString('id-ID')}</p>
                    <button class="btn-tambah">+</button>
                </div>
            </div>
        </div>
    `).join('')
}

// ============================================================
// MODAL KERANJANG
// renderModal: tampilkan sheet keranjang dari bawah.
// refreshModal: tutup sheet keranjang.
// ============================================================
function renderModal() {
    modal.classList.add('active')
    overlay.classList.add('active')
}

function refreshModal() {
    modal.classList.remove('active')
    overlay.classList.remove('active')
}

// ============================================================
// HITUNG TOTAL
// Menjumlahkan harga * qty semua item di keranjang.
// ============================================================
function hitungTotal() {
    return keranjang.reduce(function (total, current) {
        return total + (current.harga * current.qty)
    }, 0)
}

// ============================================================
// EVENT: TAMBAH ITEM KE KERANJANG
// Membaca data item dari DOM, lalu push ke array keranjang.
// Jika item sudah ada, qty-nya ditambah.
// ============================================================
document.getElementById('listProduk').addEventListener('click', function (e) {
    if (e.target.classList.contains('btn-tambah')) {
        const wrapper = e.target.closest('.menu-wrapper')
        const nama = wrapper.dataset.nama

        // Mengambil data asli dari dataMenu berdasarkan nama untuk menghindari DOM scraping
        const itemData = dataMenu.find(item => item.nama === nama)
        if (!itemData) return

        const itemAdaKah = keranjang.find(function (item) {
            return item.nama === nama
        })
        if (itemAdaKah) {
            itemAdaKah.qty += 1
        } else {
            keranjang.push({
                nama: itemData.nama,
                harga: itemData.harga,
                emoji: itemData.emoji,
                qty: 1,
                catatan: ''
            })
        }
        renderKeranjang()
        updateCartBar()
        updateMenuHighlight()
        showToast(nama + ' ditambahkan ke keranjang!')
    }
})

// ============================================================
// UPDATE CART BAR
// Menampilkan/menyembunyikan bar keranjang di bagian bawah layar
// beserta total item dan total harga.
// ============================================================
function updateCartBar() {
    const jumlahItem = document.getElementById('jumlahItem')
    const totalHarga = document.getElementById('totalHarga')

    let totalQty = keranjang.reduce(function (total, current) {
        return total + (current.qty)
    }, 0)

    if (keranjang.length === 0) {
        cartBar.classList.add('hidden')
    } else {
        cartBar.classList.remove('hidden')
        jumlahItem.textContent = totalQty
        totalHarga.textContent = 'Rp ' + hitungTotal().toLocaleString('id-ID')
    }
}

// ============================================================
// UPDATE HIGHLIGHT MENU
// Memberi tanda visual (highlight + badge qty) pada item menu
// yang sudah ada di keranjang.
// ============================================================
function updateMenuHighlight() {
    const semuaMenu = document.querySelectorAll('.menu-wrapper')
    semuaMenu.forEach(function (menu) {
        const nama = menu.dataset.nama
        const itemAdaKah = keranjang.find(function (item) {
            return item.nama === nama
        })
        if (itemAdaKah) {
            menu.classList.add('highlight')
            let qtyBadge = menu.querySelector('.qty-badge')
            if (!qtyBadge) {
                qtyBadge = document.createElement('span')
                qtyBadge.classList.add('qty-badge')
                menu.querySelector('h3').appendChild(qtyBadge)
            }
            qtyBadge.textContent = itemAdaKah.qty
        } else {
            menu.classList.remove('highlight')
            const qtyBadge = menu.querySelector('.qty-badge')
            if (qtyBadge) qtyBadge.remove()
        }
    })
}

// ============================================================
// RENDER ISI KERANJANG
// Merender ulang seluruh daftar item di dalam sheet keranjang
// beserta tombol aksi dan total harga.
// ============================================================
function renderKeranjang() {
    cartsItems.innerHTML = keranjang.map(item => `
        <div class="cart-item">
            <div class="menu-img">${item.emoji}</div>
            <div class="cart-item-content">
                <div class="cart-item-title">
                    <h4>${item.nama}</h4>
                    <p>Rp ${item.harga.toLocaleString('id-ID')}</p>
                </div>
                <div class="cart-item-action">
                    <button class="cart-btn-kurang">-</button>
                    <p>${item.qty}</p>
                    <button class="cart-btn-tambah">+</button>
                    <button class="cart-btn-hapus">Hapus Item</button>
                </div>
                <input type="text" class="cart-item-note" placeholder="Contoh: Gula dikit aja" data-nama="${item.nama}" value="${item.catatan}"
                style="margin-top: 8px; width: 100%; padding: 4px 8px; border: 1px solid #ccc; border-radius: 6px; font-size: 12px;">
            </div>
        </div>
    `).join('')
    totalPembelanjaan.textContent = 'Rp ' + hitungTotal().toLocaleString('id-ID')
}

// ============================================================
// EVENT: AKSI DI DALAM KERANJANG (kurang / tambah / hapus)
// Menggunakan event delegation — satu listener untuk semua tombol
// di dalam .cart-items.
// ============================================================
document.querySelector('.cart-items').addEventListener('click', function (e) {
    if (e.target.classList.contains('cart-btn-kurang')) {
        const nama = e.target.closest('.cart-item').querySelector('input.cart-item-note').dataset.nama
        const item = keranjang.find(function (i) {
            return i.nama === nama
        })
        item.qty -= 1
        if (item.qty === 0) {
            keranjang = keranjang.filter(function (i) {
                return i.nama !== nama
            })
        }
        updateCartBar()
        renderKeranjang()
        updateMenuHighlight()
    }
    if (e.target.classList.contains('cart-btn-tambah')) {
        const nama = e.target.closest('.cart-item').querySelector('input.cart-item-note').dataset.nama
        const item = keranjang.find(function (i) {
            return i.nama === nama
        })
        item.qty += 1
        updateCartBar()
        renderKeranjang()
        updateMenuHighlight()
    }
    if (e.target.classList.contains('cart-btn-hapus')) {
        const nama = e.target.closest('.cart-item').querySelector('input.cart-item-note').dataset.nama
        keranjang = keranjang.filter(function (i) {
            return i.nama !== nama
        })
        updateCartBar()
        renderKeranjang()
        updateMenuHighlight()
    }
})
// // ============================================================
// EVENT: Menyimpan catatan pada item
// ============================================================
document.querySelector('.cart-items').addEventListener('input', function (e) {
    if (e.target.classList.contains('cart-item-note')) {
        const namaMenu = e.target.getAttribute('data-nama')
        console.log(namaMenu)
        const item = keranjang.find(function (i) {
            return i.nama === namaMenu
        })
        if (item) {
            item.catatan = e.target.value
        }
    }

})



// ============================================================
// TOAST NOTIFICATION
// Menampilkan pesan singkat di bagian atas layar selama 1.5 detik.
// ============================================================
function showToast(pesan) {
    const toast = document.getElementById('toast')
    toast.querySelector('p').textContent = pesan
    toast.classList.add('active')
    setTimeout(function () {
        toast.classList.remove('active')
    }, 5000)
}

// ============================================================
// EVENT: FILTER KATEGORI MENU
// Memfilter daftar menu berdasarkan kategori yang diklik.
// ============================================================
document.querySelector('.filter-bar ul').addEventListener('click', function (e) {
    if (e.target.tagName === 'LI') {
        document.querySelectorAll('.filter-bar ul li').forEach(function (li) {
            li.classList.remove('active')
        })
        e.target.classList.add('active')
        const kategori = e.target.textContent.toLowerCase()
        if (kategori === 'semua') {
            renderMenu(dataMenu)
            updateMenuHighlight()
        } else {
            const filtered = dataMenu.filter(function (item) {
                return item.kategori === kategori
            })
            renderMenu(filtered)
            updateMenuHighlight()
        }
    }
})

// ============================================================
// EVENT: TOMBOL PESAN SEKARANG
// Memvalidasi keranjang tidak kosong sebelum membuka modal konfirmasi.
// ============================================================
btnCta.addEventListener('click', function () {
    if (keranjang.length === 0) {
        showToast('Silahkan pilih menu terlebih dahulu!')
    } else {
        tampilKonfirmasi()
    }
})

// ============================================================
// TAMPIL MODAL KONFIRMASI
// Mengisi ringkasan pesanan (item, meja, catatan, total)
// lalu menampilkan modal konfirmasi.
// ============================================================
function tampilKonfirmasi() {
    const listPesanan = document.getElementById('listPesanan')
    // const catatanOrder = document.getElementById('catatanOrder')
    // catatanOrder.textContent = inputCatatan.value
    listPesanan.innerHTML = ''
    keranjang.forEach(function (menu) {
        // let teksCatatan = menu.catatan !== `` ? `<br><small style="color: gray;">📝 Catatan: ${menu.catatan}</small>` : ''
        let teksCatatan = menu.catatan !== '' ? `<br><small style="color: gray;">📝 Catatan: ${menu.catatan}</small>` : ''
        listPesanan.innerHTML += `
                <li style="margin-bottom: 8px;">${menu.emoji} ${menu.nama} : ${menu.qty} pcs
                ${teksCatatan}
                </li>
                `
    })
    document.getElementById('noMejaKonfirmasi').textContent = 'Meja ' + noMeja
    document.querySelector('.modal-konfirmasi').classList.add('active')
    let totalPembayaran = document.getElementById('totalPembayaran')
    totalPembayaran.textContent = 'Rp ' + hitungTotal().toLocaleString('id-ID')
}

// ============================================================
// EVENT: KONFIRMASI PESANAN
// Mereset seluruh state aplikasi setelah pesanan dikonfirmasi.
// ============================================================
// ============================================================
// EVENT: KONFIRMASI PESANAN (Mengirim data ke server)
// ============================================================
btnKonfirmasi.addEventListener('click', async function (e) {
    e.preventDefault();
    // 1. Kumpulkan data pesanan
    const radioTerpilih = document.querySelector('input[name="metode"]:checked');

    if (!radioTerpilih) {
        showToast('Pilih metode pembayaran terlebih dahulu!');
        return;
    }
    const metodePilihan = radioTerpilih.value;

    const payloadPesanan = {
        identifier_pelanggan: noMeja,
        metode_pembayaran: metodePilihan,
        total_harga: hitungTotal(),
        items: keranjang
    };

    try {
        // 2. Kirim data ke Backend (Node.js) menggunakan fetch
        // Ubah teks tombol sementara agar pelanggan tahu sistem sedang memproses
        btnKonfirmasi.textContent = 'Mengirim pesanan...';
        btnKonfirmasi.disabled = true;

        const respons = await fetch(`${API_URL}/api/pesanan`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payloadPesanan) // Mengubah objek JS menjadi format teks JSON
        });

        const jawabanServer = await respons.json(); // Membaca balasan dari server

        // 3. Jika berhasil diterima server, tampilkan notifikasi dan reset aplikasi
        if (jawabanServer.status === 'berhasil') {
            // clearTimeout(timerKonfirmasi);
            showToast(`Pesanan ${jawabanServer.id_struk} Berhasil Diterima!`, 3500);
            window.location.href = `${API_URL}/api/struk/${jawabanServer.id_struk}`;
            modalKonfirmasi.classList.remove('active');
            modal.classList.remove('active');
            overlay.classList.remove('active');
            keranjang = [];
            renderKeranjang();
            updateCartBar();
            renderMenu(dataMenu);
            updateMenuHighlight();
            konfirmasiBayarContainer.classList.add('hidden');
            document.querySelectorAll('.metode-card input[name="metode"]').forEach(radio => radio.checked = false);
            qrContainer.classList.add('hidden');
            clearTimeout(timerKonfirmasi);

        }
    } catch (error) {
        showToast('Gagal terhubung ke sistem! Pastikan server menyala.');
        console.error(error);
    } finally {
        // Kembalikan teks tombol seperti semula setelah selesai (baik sukses maupun error)
        btnKonfirmasi.textContent = 'Konfirmasi Pesanan';
        btnKonfirmasi.disabled = false;
    }
});

// ============================================================
// EVENT: PILIH METODE PEMBAYARAN (QRIS / CASH)
// QRIS: tampilkan QR code dummy, tombol konfirmasi aktif setelah 3 detik.
// Cash: sembunyikan QR, tombol langsung aktif.
// ============================================================
document.querySelector('.pilih-metode-bayar').addEventListener('change', function (e) {
    // Hentikan timer lama (tidak perlu timer lagi)
    clearTimeout(timerKonfirmasi);

    // Reset: sembunyikan QR, disabled tombol konfirmasi
    qrContainer.classList.add('hidden');
    btnKonfirmasi.disabled = true;

    if (e.target.value === 'qris') {
        showToast('Silahkan scan QR Code untuk membayar');
        qrContainer.classList.remove('hidden');
        qrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${noMeja}-Rp${hitungTotal()}`;

        // Tampilkan tombol "Saya Sudah Bayar"
        konfirmasiBayarContainer.classList.remove('hidden');

    } else {
        // CASH
        showToast('Silahkan lakukan pembayaran ke kasir');

        // Tampilkan tombol "Saya Sudah Bayar"
        konfirmasiBayarContainer.classList.remove('hidden');
    }
});

btnSudahBayar.addEventListener('click', function () {
    // Aktifkan tombol konfirmasi
    btnKonfirmasi.disabled = false;

    // Sembunyikan tombol "Saya Sudah Bayar" (opsional)
    konfirmasiBayarContainer.classList.add('hidden');

    // Tampilkan notifikasi sukses
    showToast('✅ Pembayaran berhasil! Silahkan konfirmasi pesanan.');
});

// ============================================================
// EVENT: TUTUP MODAL & RESET STATE
// Menutup modal konfirmasi dan mereset QR, radio button,
// timer, serta status tombol konfirmasi.
// ============================================================


// document.getElementById('lihatPromo').addEventListener('click', function () {
//     showToast('Menu ini masih dalam tahap maintenance!')
// })

document.getElementById('tambahItemCart').addEventListener('click', function () {
    modal.classList.remove('active')
    overlay.classList.remove('active')
})

document.getElementById('btnTutupKonfirmasi').addEventListener('click', function () {
    clearTimeout(timerKonfirmasi)
    modalKonfirmasi.classList.remove('active')
    qrContainer.classList.add('hidden')

    konfirmasiBayarContainer.classList.add('hidden');
    document.querySelectorAll('.metode-card input[name="metode"]').forEach(function (radio) {
        radio.checked = false
    })
    btnKonfirmasi.disabled = true
})

document.querySelector('.btn-batal').addEventListener('click', function () {
    clearTimeout(timerKonfirmasi)
    btnKonfirmasi.disabled = true
    modalKonfirmasi.classList.remove('active')
    qrContainer.classList.add('hidden')
    document.querySelectorAll('.metode-card input[name="metode"]').forEach(function (radio) {
        radio.checked = false
    })
})

// ============================================================
// INISIALISASI AWAL
// Render menu dan highlight saat halaman pertama kali dibuka.
// ============================================================
ambilDataMenuDariServer();
cartBar.addEventListener('click', renderModal)
overlay.addEventListener('click', refreshModal)
