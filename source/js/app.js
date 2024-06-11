let btnOened = document.querySelector('.hamburger--open');
let btnClosed = document.querySelector('.hamburger--closed');

switchingHamburger.onclick = function () {
  btnOened.classList.remove('hamburger--open');
  btnClosed.classList.add('hamburger--closed');
}
