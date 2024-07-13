const container = document.querySelector('.slider');

document.querySelector('.slider__range').addEventListener('input', (e) => {
container.style.setProperty ('--position', `${e.target.value}%`);
})


console.log('Пивет!');




// const catsComparison = document.querySelector('.slider');
// const catsBeforeImage = document.querySelector('.slider__image-before');
// const catsAfterImage = document.querySelector('.slider__image-after');
// const catsDividerLine = document.querySelector('.slider__line');

// function dividerMouseMove(event) {
//   const dividerLeftX = catsComparison.offsetLeft;
//   const dividerWidth = catsComparison.clientWidth;
//   let mouseX = (event.clientX || event.touches[0].clientX) - dividerLeftX;
//   if (mouseX < 0) {
//     mouseX = 0;
//   } else if (mouseX > dividerWidth) {
//     mouseX = dividerWidth;
//   }
//   const size = `${((mouseX / dividerWidth) * 100).toFixed(2)}%`;
//   catsBeforeImage.style.width = size;
//   catsAfterImage.style.clipPath = `inset(0 0 0 ${size})`;
//   catsDividerLine.style.left = size;
// }
