// component.loader.js
document.addEventListener('DOMContentLoaded', () => {
  const loadModule = async (fileName, label) => {
    const url = new URL(`./${fileName}`, import.meta.url);
    try {
      const module = await import(url);
      console.log(`[loader] ${label} module loaded from ${url}`);
      module.default?.();  // call the init function
    }
    catch (err) {
      console.error(`[loader] failed to load ${label}:`, err);
    }
  };

  const loadExternalScript = (src, label) => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => {
        console.log(`[loader] ${label} external script loaded`);
        resolve();
      };
      script.onerror = () => {
        console.error(`[loader] failed to load external script: ${label}`);
        reject();
      };
      document.head.appendChild(script);
    });
  };

  const loadExternalCSS = (href, label, nonce = '') => {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      if (nonce) {
        link.nonce = nonce;
      }
      link.onload = () => {
        console.log(`[loader] ${label} stylesheet loaded`);
        resolve();
      };
      link.onerror = () => {
        console.error(`[loader] failed to load stylesheet: ${label}`);
        reject();
      };
      document.head.appendChild(link);
    });
  };

  if (document.querySelector('#slider_logoCarousel')) {
    loadExternalScript('https://cdn.jsdelivr.net/npm/@splidejs/splide/dist/js/splide.min.js', 'splide core js');
    loadExternalScript('https://cdn.jsdelivr.net/npm/@splidejs/splide-extension-auto-scroll/dist/js/splide-extension-auto-scroll.min.js', 'splide scroll js');
    loadExternalCSS('https://solcast.github.io/static/assets/css/splide-core.min.css', 'splide css');
    loadModule('component.logoCarousel.js', 'logoCarousel');
  }

  if (document.querySelector('.testimonial-slider_component')) {
    loadExternalScript('https://cdn.jsdelivr.net/npm/swiper@8/swiper-bundle.min.js', 'swiper-bundle js');
    loadExternalCSS('https://cdn.jsdelivr.net/npm/swiper@8/swiper-bundle.min.css', 'swiper-bundle css');
    loadModule('component.testimonial.js', 'testimonial');
  }

  if (document.querySelector('[data-script-loader="component.counter"]')) {
    loadExternalScript('https://cdn.jsdelivr.net/npm/@srexi/purecounterjs/dist/purecounter_vanilla.js', 'purecounter');
    loadModule('component.counter.js', 'counter');
  }

  if (document.querySelector('.component_verticle-tabs')) {
    loadModule('component.v-tabs.indicator.js', 'vertice tabs');
  }

  if (document.querySelector('form')) {
    loadModule('component.form-preselect.js', 'form preselect');
  }

  if (document.querySelector('[data-tracking="gtm-enabled"]')) {
    loadModule('component.gtm-tracking.js', 'GTM tracking');
  }

  if (document.querySelector('[data-script-loader="accuracy-tool"]')) {
    loadExternalScript('https://api.mapbox.com/mapbox-gl-js/v3.5.1/mapbox-gl.js', 'mapbox-gl');
    loadModule('accuracy-tool.js', 'accuracy tool');
  }

  if (document.querySelector('[data-script-loader="component.worldmap"]')) {
    loadModule('component.worldmap.js', 'latest world map');
  }

  if (document.querySelector('[data-script-loader="component.video-embed"]')) {
    loadModule('component.video-embed.js', 'video-embed');
  }

  if (document.querySelector('[data-script-loader="component.other-related-products"]')) {
    loadModule('component.other-related-products.js', 'other related products');
  }

  if (document.querySelector('.embed-graph')) {
    loadModule('component.graph.js', 'graph');
  }

  if (document.querySelector('[data-script-loader="component.mapbox"]')) {
    loadExternalScript('https://api.mapbox.com/mapbox-gl-js/v3.5.1/mapbox-gl.js', 'mapbox-gl');
    loadModule('mapbox.config.lta.js', 'mapbox-config');
    loadModule('mapboxSetup.js', 'mapbox-setup');
    loadExternalCSS('https://api.mapbox.com/mapbox-gl-js/v3.5.1/mapbox-gl.css', 'Mapbox CSS');
    loadExternalCSS('https://solcast.com/static/assets/css/mapbox-gradients.css', 'Mapbox Gradients');
    loadExternalCSS('https://solcast.com/static/assets/css/mapbox-styles.css', 'Mapbox Styles');
  }

  if (window.location.pathname.includes('/pricing/')) {
   loadModule('page.pricing.js', 'pricing page');
  }
  
  if (window.location.pathname.includes('/search')) {
   loadModule('page.search.js', 'search page');
  }
  
});