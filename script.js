import { dataMenu } from "./data/menu.js"
let keranjang = []


const cartBar = document.querySelector('.cart-bar')
const modal = document.querySelector('.modal')
// const btnTambah = document.querySelectorAll('.btn-tambah')
const overlay = document.querySelector('.overlay')
const cartsItems = document.querySelector('.cart-items')
const totalPembelanjaan = document.getElementById('totalPembelanjaan')
const inputCatatan = document.querySelector('.note-box input')
const btnCta = document.getElementById('btnCta')


// Render Menu

function renderMenu(data) {
    const listProduk = document.getElementById('listProduk')
    listProduk.innerHTML = ''
    data.forEach(function (item) {
        listProduk.innerHTML += `
    <div class="menu-wrapper">
        <img src="${item.gambar}" alt="Foto ${item.nama}">
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

// 1. Munculkan Modal

function renderModal() {
    // console.log('render modal')
    modal.classList.add('active')
    overlay.classList.add('active')

}

function refreshModal() {
    modal.classList.remove('active')
    overlay.classList.remove('active')
}

function hitungTotal() {
    return keranjang.reduce(function (total, current) {
        return total + (current.harga * current.qty)
    }, 0)
}

document.getElementById('listProduk').addEventListener('click', function (e) {
    if (e.target.classList.contains('btn-tambah')) {
        const wrapper = e.target.closest('.menu-wrapper')
        const nama = wrapper.querySelector('h3').firstChild.textContent.trim()
        const hargaRaw = wrapper.querySelector('.menu-action p').textContent
        const harga = parseInt(hargaRaw.replace(/\./g, ''))
        const gambar = wrapper.querySelector('img').src

        const itemAdaKah = keranjang.find(function (item) {
            return item.nama === nama
        })
        if (itemAdaKah) {
            itemAdaKah.qty += 1
        } else {
            keranjang.push({ nama, harga, gambar, qty: 1 })
        }
        renderKeranjang()
        updateCartBar()
        updateMenuHighlight()
        showToast(nama + ' ditambahkan ke keranjang!')
    }
})

function updateCartBar() {
    const jumlahItem = document.getElementById('jumlahItem')
    const totalHarga = document.getElementById('totalHarga')

    let totalQty = keranjang.reduce(function (total, current) {
        return total + (current.qty)
    }, 0)

    // console.log('Total Qty saat ini :' + totalQty)

    if (keranjang.length === 0) {
        cartBar.classList.add('hidden')
    } else {
        cartBar.classList.remove('hidden')
        jumlahItem.textContent = totalQty
        totalHarga.textContent = 'Rp ' + hitungTotal().toLocaleString('id-ID')

    }
}

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

function renderKeranjang() {
    cartsItems.innerHTML = ``
    keranjang.forEach(function (item) {
        cartsItems.innerHTML += `
        <div class="cart-item">
            <img src="${item.gambar}" alt="Foto ${item.nama}">
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

document.querySelector('.cart-items').addEventListener('click', function (e) {
    if (e.target.classList.contains('cart-btn-kurang')) {
        const nama = e.target.closest('.cart-item').querySelector('h4').textContent
        console.log('nama: ', nama)
        console.log('keranjang: ', keranjang)

        const item = keranjang.find(function (i) {
            return i.nama === nama
        })
        console.log('item: ', item)

        item.qty -= 1
        if (item.qty === 0) {
            keranjang = keranjang.filter(function (i) {
                return i.nama !== nama
            })
            updateCartBar()
            renderKeranjang()
            updateMenuHighlight()

        } else {
            updateCartBar()
            renderKeranjang()
            updateMenuHighlight()

        }
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

btnCta.addEventListener('click', function () {
    let catatan = inputCatatan.value
    const dataOrder = {
        keranjang: keranjang,
        catatan: catatan,
        meja: 'Meja 1'
    }
    console.log('Pesanan anda adalah : ', dataOrder)
})

function showToast(pesan) {
    const toast = document.getElementById('toast')
    toast.querySelector('p').textContent = pesan
    toast.classList.add('active')

    setTimeout(function () {
        toast.classList.remove('active')
    }, 1500)

}

document.querySelector('.filter-bar ul').addEventListener('click', function (e) {
    if (e.target.tagName === 'LI') {
        document.querySelectorAll('.filter-bar ul li').forEach(function (li) {
            li.classList.remove('active')
        })
        e.target.classList.add('active')
        const kategori = e.target.textContent.toLowerCase()
        if (kategori === 'semua') {
            renderMenu(dataMenu)
        } else {
            const filtered = dataMenu.filter(function (item) {
                return item.kategori === kategori
            })
            renderMenu(filtered)
        }
    }
})

renderMenu(dataMenu)
cartBar.addEventListener('click', renderModal)
overlay.addEventListener('click', refreshModal)
