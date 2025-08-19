// component.loader.js
document.addEventListener('DOMContentLoaded', async () => {
  // ---- shared caches to dedupe loads ----
  const scriptCache = new Map(); // src -> Promise<void>
  const cssCache = new Map();    // href -> Promise<void>
  const moduleCache = new Map(); // fileName -> Promise<any>

  const loadModule = async (fileName, label) => {
    if (!moduleCache.has(fileName)) {
      const url = new URL(`./${fileName}`, import.meta.url);
      moduleCache.set(fileName, import(url)
        .then((module) => {
          console.log(`[loader] ${label} module loaded from ${url}`);
          module.default?.(); // call the init function
          return module;
        })
        .catch((err) => {
          console.error(`[loader] failed to load ${label}:`, err);
          throw err;
        })
      );
    }
    return moduleCache.get(fileName);
  };

  const loadExternalScript = (src, label) => {
    if (scriptCache.has(src)) return scriptCache.get(src);

    const p = new Promise((resolve, reject) => {
      const exists = document.querySelector(`script[src="${src}"]`);
      if (exists) {
        console.log(`[loader] ${label} external script already present`);
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = () => {
        console.log(`[loader] ${label} external script loaded`);
        resolve();
      };
      script.onerror = () => {
        console.error(`[loader] failed to load external script: ${label}`);
        reject(new Error(`Failed to load ${src}`));
      };
      document.head.appendChild(script);
    });

    scriptCache.set(src, p);
    return p;
  };

  const loadExternalCSS = (href, label, nonce = '') => {
    if (cssCache.has(href)) return cssCache.get(href);

    const p = new Promise((resolve, reject) => {
      const exists = document.querySelector(`link[rel="stylesheet"][href="${href}"]`);
      if (exists) {
        console.log(`[loader] ${label} stylesheet already present`);
        resolve();
        return;
      }
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      if (nonce) link.nonce = nonce;
      link.onload = () => {
        console.log(`[loader] ${label} stylesheet loaded`);
        resolve();
      };
      link.onerror = () => {
        console.error(`[loader] failed to load stylesheet: ${label}`);
        reject(new Error(`Failed to load ${href}`));
      };
      document.head.appendChild(link);
    });

    cssCache.set(href, p);
    return p;
  };

  // ---------- Logo Carousel (Splide) ----------
  if (document.querySelector('#slider_logoCarousel')) {
    await Promise.all([
      loadExternalScript('https://cdn.jsdelivr.net/npm/@splidejs/splide/dist/js/splide.min.js', 'splide core js'),
      loadExternalScript('https://cdn.jsdelivr.net/npm/@splidejs/splide-extension-auto-scroll/dist/js/splide-extension-auto-scroll.min.js', 'splide scroll js'),
      loadExternalCSS('https://solcast.github.io/static/assets/css/splide-core.min.css', 'splide css'),
    ]);
    await loadModule('component.logoCarousel.js', 'logoCarousel');
  }

  // ---------- Testimonial Slider (Swiper) ----------
  if (document.querySelector('.testimonial-slider_component')) {
    await Promise.all([
      loadExternalScript('https://cdn.jsdelivr.net/npm/swiper@8/swiper-bundle.min.js', 'swiper-bundle js'),
      loadExternalCSS('https://cdn.jsdelivr.net/npm/swiper@8/swiper-bundle.min.css', 'swiper-bundle css'),
    ]);
    await loadModule('component.testimonial.js', 'testimonial');
  }

  // ---------- Counter (PureCounter) ----------
  if (document.querySelector('[data-script-loader="component.counter"]')) {
    await loadExternalScript('https://cdn.jsdelivr.net/npm/@srexi/purecounterjs/dist/purecounter_vanilla.js', 'purecounter');
    await loadModule('component.counter.js', 'counter');
  }

  // ---------- Vertical tabs indicator ----------
  if (document.querySelector('.component_verticle-tabs')) {
    await loadModule('component.v-tabs.indicator.js', 'vertice tabs');
  }

  // ---------- Form preselect ----------
  if (document.querySelector('form')) {
    await loadModule('component.form-preselect.js', 'form preselect');
  }

  // ---------- GTM tracking ----------
  if (document.querySelector('[data-tracking="gtm-enabled"]')) {
    await loadModule('component.gtm-tracking.js', 'GTM tracking');
  }

  // ---------- Accuracy tool (Mapbox) ----------
  if (document.querySelector('[data-script-loader="accuracy-tool"]')) {
    await Promise.all([
      loadExternalScript('https://api.mapbox.com/mapbox-gl-js/v3.5.1/mapbox-gl.js', 'mapbox-gl'),
      loadExternalCSS('https://api.mapbox.com/mapbox-gl-js/v3.5.1/mapbox-gl.css', 'Mapbox CSS'),
      loadExternalCSS('https://solcast.com/static/assets/css/accuracy-tool.css', 'Mapbox Gradients'),
    ]);
    await loadModule('accuracy-tool.js', 'accuracy tool');
  }

  // ---------- Forcast Accuracy tool (Mapbox) ----------
  if (document.querySelector('[data-script-loader="forecast-accuracy-tool"]')) {
    await Promise.all([
      loadExternalScript('https://api.mapbox.com/mapbox-gl-js/v3.5.1/mapbox-gl.js', 'mapbox-gl'),
      loadExternalCSS('https://api.mapbox.com/mapbox-gl-js/v3.5.1/mapbox-gl.css', 'Mapbox CSS'),
      loadExternalCSS('https://solcast.com/static/assets/css/forecast-accuracy-tool.css', 'Mapbox Gradients'),
    ]);
    await loadModule('forecast-accuracy-tool.js', 'accuracy tool');
  }

  // ---------- Latest world map ----------
  if (document.querySelector('[data-script-loader="component.worldmap"]')) {
    await loadModule('component.worldmap.js', 'latest world map');
  }

  // ---------- Video embed ----------
  if (document.querySelector('[data-script-loader="component.video-embed"]')) {
    await loadModule('component.video-embed.js', 'video-embed');
  }

  // ---------- Other related products ----------
  if (document.querySelector('[data-script-loader="component.other-related-products"]')) {
    await loadModule('component.other-related-products.js', 'other related products');
  }

  // ---------- Graph embeds ----------
  if (document.querySelector('.embed-graph')) {
    await loadModule('component.graph.js', 'graph');
  }

  // ---------- Mapbox pages ----------
  if (document.querySelector('[data-script-loader="component.mapbox"]')) {
    await Promise.all([
      loadExternalScript('https://api.mapbox.com/mapbox-gl-js/v3.5.1/mapbox-gl.js', 'mapbox-gl'),
      loadExternalCSS('https://api.mapbox.com/mapbox-gl-js/v3.5.1/mapbox-gl.css', 'Mapbox CSS'),
      loadExternalCSS('https://solcast.com/static/assets/css/mapbox-gradients.css', 'Mapbox Gradients'),
      loadExternalCSS('https://solcast.com/static/assets/css/mapbox-styles.css', 'Mapbox Styles'),
    ]);
    await loadModule('mapbox.config.lta.js', 'mapbox-config');
    await loadModule('mapboxSetup.js', 'mapbox-setup');
  }

  // ---------- Per-page modules ----------
  if (window.location.pathname.includes('/pricing/')) {
    await loadModule('page.pricing.js', 'pricing page');
  }

  if (window.location.pathname.includes('/search')) {
    await loadModule('page.search.js', 'search page');
  }
});
