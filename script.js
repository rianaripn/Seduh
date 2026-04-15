const cartBar = document.querySelector('.cart-bar')
const modal = document.querySelector('.modal')
const tambahItem = document.getElementById('tambahItem')
const overlay = document.querySelector('.overlay')


function renderModal() {
    console.log('render modal')
    modal.classList.add('active')
    overlay.classList.add('active')

}

function refreshModal() {
    modal.classList.remove('active')
    overlay.classList.remove('active')
}

cartBar.addEventListener('click', renderModal)
overlay.addEventListener('click', refreshModal)