// ============================================================
// IMPORTS & STATE
// ============================================================
import { dataMenu } from "./data/menu.js"
let keranjang = []

// ============================================================
// REFERENSI ELEMEN DOM
// ============================================================
const cartBar = document.querySelector('.cart-bar')
const modal = document.querySelector('.modal')
const overlay = document.querySelector('.overlay')
const cartsItems = document.querySelector('.cart-items')
const totalPembelanjaan = document.getElementById('totalPembelanjaan')
const inputCatatan = document.querySelector('.note-box input')
const btnCta = document.getElementById('btnCta')
const modalKonfirmasi = document.querySelector('.modal-konfirmasi')
const ringkasanOrder = document.getElementById('ringkasanOrder')
const qrContainer = document.getElementById('qrContainer')
const qrImage = document.getElementById('qrImage')
const btnKonfirmasi = document.getElementById('btnKonfirmasi')
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
    listProduk.innerHTML = ''
    data.forEach(function (item) {
        listProduk.innerHTML += `
    <div class="menu-wrapper">
        <div class="menu-img">${item.emoji}</div>
        <div class="menu-content">
            <div class="menu-title">
                <h3>${item.nama}</h3>
                <p>${item.deskripsi}</p>
            </div>
            <div class="menu-action">
                <p>${item.harga.toLocaleString('id-ID')}</p>
                <button class="btn-tambah">+</button>
            </div>
        </div>
    </div>
    `
    })
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
        const nama = wrapper.querySelector('h3').firstChild.textContent.trim()
        const hargaRaw = wrapper.querySelector('.menu-action p').textContent
        const harga = parseInt(hargaRaw.replace(/\./g, ''))
        const emoji = wrapper.querySelector('.menu-img').textContent

        const itemAdaKah = keranjang.find(function (item) {
            return item.nama === nama
        })
        if (itemAdaKah) {
            itemAdaKah.qty += 1
        } else {
            keranjang.push({ nama, harga, emoji, qty: 1 })
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
        const nama = menu.querySelector('h3').firstChild.textContent.trim()
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
    cartsItems.innerHTML = ``
    keranjang.forEach(function (item) {
        cartsItems.innerHTML += `
        <div class="cart-item">
            <div class="menu-img">${item.emoji}</div>
            <div class="cart-item-content">
                <div class="cart-item-title">
                    <h4>${item.nama}</h4>
                    <p>${item.harga}</p>
                </div>
            <div class="cart-item-action">
                <button class="cart-btn-kurang">-</button>
                <p>${item.qty}</p>
                <button class="cart-btn-tambah">+</button>
                <button class="cart-btn-hapus">Hapus Item</button>
            </div>
       </div>
       `
    })
    totalPembelanjaan.textContent = 'Rp ' + hitungTotal().toLocaleString('id-ID')
}

// ============================================================
// EVENT: AKSI DI DALAM KERANJANG (kurang / tambah / hapus)
// Menggunakan event delegation — satu listener untuk semua tombol
// di dalam .cart-items.
// ============================================================
document.querySelector('.cart-items').addEventListener('click', function (e) {
    if (e.target.classList.contains('cart-btn-kurang')) {
        const nama = e.target.closest('.cart-item').querySelector('h4').textContent
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
        const nama = e.target.closest('.cart-item').querySelector('h4').textContent
        const item = keranjang.find(function (i) {
            return i.nama === nama
        })
        item.qty += 1
        updateCartBar()
        renderKeranjang()
        updateMenuHighlight()
    }
    if (e.target.classList.contains('cart-btn-hapus')) {
        const nama = e.target.closest('.cart-item').querySelector('h4').textContent
        keranjang = keranjang.filter(function (i) {
            return i.nama !== nama
        })
        updateCartBar()
        renderKeranjang()
        updateMenuHighlight()
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
    }, 1500)
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
        let catatan = inputCatatan.value
        const dataOrder = {
            keranjang: keranjang,
            catatan: catatan,
            meja: 'Meja ' + noMeja
        }
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
    const catatanOrder = document.getElementById('catatanOrder')
    catatanOrder.textContent = inputCatatan.value
    listPesanan.innerHTML = ''
    keranjang.forEach(function (menu) {
        listPesanan.innerHTML += `
                <li>${menu.emoji} ${menu.nama} : ${menu.qty} pcs</li>
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
btnKonfirmasi.addEventListener('click', function () {
    showToast('Pesanan Anda Berhasil, ditunggu ya pesanan nya!')
    document.querySelector('.note-box input').value = ''
    modalKonfirmasi.classList.remove('active')
    modal.classList.remove('active')
    overlay.classList.remove('active')
    keranjang = []
    renderKeranjang()
    updateCartBar()
    renderMenu(dataMenu)
    updateMenuHighlight()
    document.querySelectorAll('.metode-card input[name="metode"]').forEach(function (radio) {
        radio.checked = false
    })
    qrContainer.classList.add('hidden')
    clearTimeout(timerKonfirmasi)
    btnKonfirmasi.disabled = true
})

// ============================================================
// EVENT: PILIH METODE PEMBAYARAN (QRIS / CASH)
// QRIS: tampilkan QR code dummy, tombol konfirmasi aktif setelah 3 detik.
// Cash: sembunyikan QR, tombol langsung aktif.
// ============================================================
document.querySelector('.pilih-metode-bayar').addEventListener('change', function (e) {
    if (e.target.value === 'qris') {
        showToast('Silahkan melakukan pembayaran melalui QR Code ini')
        qrContainer.classList.remove('hidden')
        qrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${noMeja}-Rp${hitungTotal()}`
        btnKonfirmasi.disabled = true
        timerKonfirmasi = setTimeout(function () {
            btnKonfirmasi.disabled = false
        }, 3000)
    } else {
        qrContainer.classList.add('hidden')
        clearTimeout(timerKonfirmasi)
        btnKonfirmasi.disabled = false
        showToast('Silahkan pergi ke kasir untuk melakukan payment')
    }
})

// ============================================================
// EVENT: TUTUP MODAL & RESET STATE
// Menutup modal konfirmasi dan mereset QR, radio button,
// timer, serta status tombol konfirmasi.
// ============================================================
document.getElementById('lihatPromo').addEventListener('click', function () {
    showToast('Menu ini masih dalam tahap maintenance!')
})

document.getElementById('tambahItemCart').addEventListener('click', function () {
    modal.classList.remove('active')
    overlay.classList.remove('active')
})

document.getElementById('btnTutupKonfirmasi').addEventListener('click', function () {
    clearTimeout(timerKonfirmasi)
    modalKonfirmasi.classList.remove('active')
    qrContainer.classList.add('hidden')
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
renderMenu(dataMenu)
updateMenuHighlight()
cartBar.addEventListener('click', renderModal)
overlay.addEventListener('click', refreshModal)
