ymaps.ready(function () {
  var myMap = new ymaps.Map('map', {
    center: [59.938631, 30.323037],
    zoom: 15
  }, {
    searchControlProvider: 'yandex#search'
  }),

    // Создаём макет содержимого.
    MyIconContentLayout = ymaps.templateLayoutFactory.createClass(
      '<div style="color: #FFFFFF; font-weight: bold;">$[properties.iconContent]</div>'
    ),

    myPlacemark = new ymaps.Placemark(myMap.getCenter(), {
      hintContent: 'Собственный значок метки',
      balloonContent: 'ул. Большая Конюшенная, д. 19/8, </b><br/>' + ' Санкт-Петербург'
    }, {
      // Опции.
      // Необходимо указать данный тип макета.
      iconLayout: 'default#image',
      // Своё изображение иконки метки.
      iconImageHref: '../img/tmp/map-pin.png',
      // Размеры метки.
      iconImageSize: [113, 106],
      // Смещение левого верхнего угла иконки относительно
      // её "ножки" (точки привязки).
      // iconImageOffset: [5, 38]
    });

  myMap.geoObjects
    .add(myPlacemark);
});
