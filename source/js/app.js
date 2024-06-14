document.body.classList.remove('no-js');

let btnHamburger = document.querySelector('.hamburger');
let ulMainNavList = document.querySelector('.main-nav__list');

btnHamburger.addEventListener('click', function () {
  ulMainNavList.classList.toggle('visible');
  btnHamburger.classList.toggle('hamburger--open');
  btnHamburger.classList.toggle('hamburger--closed');

})

console.log('Hi!');
