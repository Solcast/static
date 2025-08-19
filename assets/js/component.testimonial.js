document.querySelectorAll(".testimonial-slider_component").forEach((component) => {
  const cmsWrap = component.querySelector(".swiper");
  if (!cmsWrap) return;

  const swiper = new Swiper(cmsWrap, {
    autoplay: {
      delay: 4000,
      disableOnInteraction: false,
      pauseOnMouseEnter: true,
    },
    slidesPerView: "auto",
    followFinger: true,
    freeMode: false,
    slideToClickedSlide: false,
    centeredSlides: false,
    autoHeight: false,
    speed: 450,
    slideActiveClass: "is-active",
    slideDuplicateActiveClass: "is-active",
    mousewheel: {
      forceToAxis: true,
    },
    keyboard: {
      enabled: true,
      onlyInViewport: true,
    },
    navigation: {
      nextEl: component.querySelector(".testimonial-slider_btn_element.is-next"),
      prevEl: component.querySelector(".testimonial-slider_btn_element.is-prev"),
    },
    scrollbar: {
      el: component.querySelector(".testimonial-slider_draggable_wrap"),
      draggable: true,
      dragClass: "testimonial-slider_draggable_handle",
      snapOnRelease: true,
    },
  });
});