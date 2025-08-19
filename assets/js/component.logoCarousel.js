// component.logoCarousel.js
export default function initLogoCarousel() {
  console.log('[logoCarousel] init');
  new Splide('#slider_logoCarousel', {
    type          : 'loop',
    drag          : 'free',
    gap           : '2rem',
    autoWidth     : true,
    pauseOnHover  : true,
    pauseOnFocus  : true,
    focusableNodes: 'img',
    arrows        : false,
    pagination    : false,
    autoScroll    : { speed: 0.6 },
    reducedMotion : { speed: 0, autoplay: 'pause' },
  }).mount(window.splide.Extensions);
}
