document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".main-advantages-swiper").forEach(function (root) {
    new Swiper(root, {
      slidesPerView: "auto",
      speed: 1500,
      spaceBetween: 14,
      pagination: {
        el: root.querySelector(".swiper-pagination"),
        clickable: true,
      },
    });
  });

  document.querySelectorAll(".main-gallery-swiper").forEach(function (root) {
    new Swiper(root, {
      slidesPerView: "auto",
      speed: 1500,
      spaceBetween: 14,
      navigation: {
        nextEl: root.closest(".main-gallery-swiper-cont").querySelector(".swiper-btn-next"),
        prevEl: root.closest(".main-gallery-swiper-cont").querySelector(".swiper-btn-prev"),
      },
      pagination: {
        el: root.querySelector(".swiper-pagination"),
        clickable: true,
      },
    });
  });
});
