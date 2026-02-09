// Component and Dependancy Loader
// Loads dependant scripts based on element visibility in DOM as well as CSP blocked Webflow scripts.
(() => {
  if (window.__loaderInitialized__) return;
  window.__loaderInitialized__ = true;

  const onReady = (fn) =>
    document.readyState === "loading"
      ? document.addEventListener("DOMContentLoaded", fn, { once: true })
      : fn();

  onReady(async () => {
    // --- Matchers ---
    const JQ_REGEX = /d3e54v103j8qbb\.cloudfront\.net\/js\/jquery-\d+\.\d+\.\d+(?:\.min)?(?:\.[a-z0-9]+)?\.js(?:\?.*)?/i;
    const WEBFLOW_REGEX = /cdn\.prod\.website-files\.com\/[^/]+\/js\/webflow\.(?:[^/]+)\.js(?:\?.*)?/i;
    const WEBFONT_REGEX = /ajax\.googleapis\.com\/ajax\/libs\/webfont\/\d+(?:\.\d+)*\/webfont(?:\.min)?\.js(?:\?.*)?/i;
    const RECAPTCHA_REGEX = /www\.google\.com\/recaptcha\/api\.js(?:\?.*)?$/i;
    const GSAP_REGEX = /cdn\.prod\.website-files\.com\/gsap\/[^/]+\/gsap\.min\.js(?:\?.*)?/i;

    const priorityOf = (src) => {
      if (JQ_REGEX.test(src)) return 10;
      if (WEBFLOW_REGEX.test(src)) return 20;
      if (RECAPTCHA_REGEX.test(src)) return 30;
      if (WEBFONT_REGEX.test(src)) return 40;
      if (GSAP_REGEX.test(src)) return 50;
      return 100;
    };

    // --- Injectors ---
    const forceLoadScript = (src, opts) =>
      new Promise((resolve, reject) => {
        const s = document.createElement("script");
        s.src = src;
        if (opts?.async !== false) s.async = true;
        if (opts?.defer) s.defer = true;
        s.onload = resolve;
        s.onerror = () => reject(new Error(`Failed ${src}`));
        document.head.appendChild(s);
      });

    // --- Map-Story Widget Helper --
    const loadMapStoryWidget = () =>
      new Promise((resolve, reject) => {
      const container = document.querySelector("#map-story");
      if (!container) return resolve();

      const src =
        "https://static.solcast.com/2025-global-interactive-story/js/map-story-widget.iife.js";

      // Prevent double-injection
      if (document.querySelector(`script[src="${src}"]`)) {
        return resolve();
      }

      const mapboxToken = container.getAttribute("component-data-mapbox-token");
      const dataContainer = container.getAttribute("component-data-container");

      const s = document.createElement("script");
      s.src = src;
      s.async = true;

      if (dataContainer) {
        s.setAttribute("data-container", dataContainer);
      }

      if (mapboxToken) {
        s.setAttribute("data-mapbox-token", mapboxToken);
      }

      s.onload = resolve;
      s.onerror = () => reject(new Error("Failed to load Map Story widget"));

      document.head.appendChild(s);
    });
  

    // Function to allow loading of External JS
    const loadExternalScript = (src, label) => {
      loadExternalScript.cache ??= new Map();
      if (loadExternalScript.cache.has(src)) return loadExternalScript.cache.get(src);

      const p = new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) return resolve();
        const s = document.createElement("script");
        s.src = src;
        s.async = true;
        s.onload = resolve;
        s.onerror = () => reject(new Error(`Failed ${src}`));
        document.head.appendChild(s);
      });

      loadExternalScript.cache.set(src, p);
      return p;
    };

    // Function to allow loading of External CSS
    const loadExternalCSS = (href, label) => {
      loadExternalCSS.cache ??= new Map();
      if (loadExternalCSS.cache.has(href)) return loadExternalCSS.cache.get(href);

      const p = new Promise((resolve, reject) => {
        if (document.querySelector(`link[rel="stylesheet"][href="${href}"]`)) return resolve();
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = href;
        link.onload = resolve;
        link.onerror = () => reject(new Error(`Failed CSS ${href}`));
        document.head.appendChild(link);
      });

      loadExternalCSS.cache.set(href, p);
      return p;
    };

    // Function to allow loading of module scripts
    const loadModule = (fileName, label) => {
      loadModule.cache ??= new Map();
      if (!loadModule.cache.has(fileName)) {
        const url = new URL(`./${fileName}`, import.meta.url);
        loadModule.cache.set(
          fileName,
          import(url)
            .then((m) => {
              m.default?.();
              return m;
            })
            .catch((e) => {
              throw e;
            })
        );
      }
      return loadModule.cache.get(fileName);
    };

    // --- 1) Reinjection (singleton-safe) ---
    // Reinjects CSP blocked scripts
    const allSrcs = (() => {
      const list = document.scripts;
      const out = [];
      for (let i = 0; i < list.length; i++) {
        const src = list[i].getAttribute("src");
        if (src) out.push(src);
      }
      return out;
    })();

    const found = {
      jquery: allSrcs.filter((s) => JQ_REGEX.test(s)),
      webflow: allSrcs.filter((s) => WEBFLOW_REGEX.test(s)),
      recaptcha: allSrcs.filter((s) => RECAPTCHA_REGEX.test(s)),
      webfont: allSrcs.filter((s) => WEBFONT_REGEX.test(s)),
      gsap: allSrcs.filter((s) => GSAP_REGEX.test(s)),
    };

    const need = [];
    if (!window.jQuery && found.jquery.length) need.push(found.jquery[0]);
    for (const src of found.webflow) need.push(src);
    if (!window.grecaptcha && found.recaptcha.length) need.push(found.recaptcha[0]);
    if (!window.WebFont && found.webfont.length) need.push(found.webfont[0]);
    if (!window.gsap && found.gsap.length) need.push(found.gsap[0]);

    if (need.length) {
      const jqSrc = need.find((s) => JQ_REGEX.test(s));
      const webflowList = need.filter((s) => WEBFLOW_REGEX.test(s));
      const others = need.filter((s) => !JQ_REGEX.test(s) && !WEBFLOW_REGEX.test(s));

      try {
        if (jqSrc) await forceLoadScript(jqSrc, { async: true });
        for (const src of webflowList) await forceLoadScript(src);
        if (others.length) {
          await Promise.allSettled(
            others.map((src) =>
              forceLoadScript(
                src,
                RECAPTCHA_REGEX.test(src) ? { async: true, defer: true } : { async: true }
              )
            )
          );
        }
      } catch (e) {
        // swallow
      }
    }

    // --- 2) Conditional components (parallel where safe) ---
    const has = (sel) => document.querySelector(sel) !== null;
    const path = window.location.pathname;
    const tasks = [];

    // ---------- Logo Carousel (Splide) ----------
    if (has("#slider_logoCarousel")) {
      tasks.push(
        Promise.all([
          loadExternalScript("https://cdn.jsdelivr.net/npm/@splidejs/splide/dist/js/splide.min.js", "splide"),
          loadExternalScript(
            "https://cdn.jsdelivr.net/npm/@splidejs/splide-extension-auto-scroll/dist/js/splide-extension-auto-scroll.min.js",
            "splide-auto"
          ),
          loadExternalCSS("https://solcast.github.io/static/assets/css/splide-core.min.css", "splide-css"),
        ]).then(() => loadModule("component.logoCarousel.js", "logoCarousel"))
      );
    }

    // ---------- Testimonial Slider (Swiper) ----------
    if (has(".testimonial-slider_component")) {
      tasks.push(
        Promise.all([
          loadExternalScript("https://cdn.jsdelivr.net/npm/swiper@8/swiper-bundle.min.js", "swiper"),
          loadExternalCSS("https://cdn.jsdelivr.net/npm/swiper@8/swiper-bundle.min.css", "swiper-css"),
        ]).then(() => loadModule("component.testimonial.js", "testimonial"))
      );
    }

    // ---------- Counter (PureCounter) ----------
    if (has('[data-script-loader="component.counter"]')) {
      tasks.push(
        loadExternalScript(
          "https://cdn.jsdelivr.net/npm/@srexi/purecounterjs/dist/purecounter_vanilla.js",
          "purecounter"
        ).then(() => loadModule("component.counter.js", "counter"))
      );
    }

    // ---------- Vertical tabs indicator ----------
    if (has(".component_verticle-tabs")) {
      tasks.push(loadModule("component.v-tabs.indicator.js", "v-tabs"));
    }

    // ---------- Form helpers ----------
    if (has("form")) {
      tasks.push(loadModule("component.form-select-helper.js", "form-select-helper"));
      tasks.push(loadModule("component.recaptch-helper.js", "recaptcha-helper"));
      tasks.push(loadModule("component.form-country-select.js", "country-select"));
    }

    // ---------- GTM tracking ----------
    if (has('[data-tracking="gtm-enabled"]')) {
      tasks.push(loadModule("component.gtm-tracking.js", "gtm"));
    }

    // ---------- Mapbox Prerequisits ----------
    const mapboxCoreJS = "https://api.mapbox.com/mapbox-gl-js/v3.5.1/mapbox-gl.js";
    const mapboxCoreCSS = "https://api.mapbox.com/mapbox-gl-js/v3.5.1/mapbox-gl.css";

    // ---------- Accuracy tool (Mapbox) ----------
    if (has('[data-script-loader="accuracy-tool"]')) {
      tasks.push(
        Promise.all([
          loadExternalScript(mapboxCoreJS, "mapbox-gl"),
          loadExternalCSS(mapboxCoreCSS, "mapbox-css"),
          loadExternalCSS("https://solcast.com/static/assets/css/accuracy-tool.css", "accuracy-css"),
        ]).then(() => loadModule("accuracy-tool.js", "accuracy-tool"))
      );
    }

    // ---------- Forcast Accuracy tool (Mapbox) ----------
    if (has('[data-script-loader="forecast-accuracy-tool"]')) {
      tasks.push(
        Promise.all([
          loadExternalScript(mapboxCoreJS, "mapbox-gl"),
          loadExternalCSS(mapboxCoreCSS, "mapbox-css"),
          loadExternalCSS("https://solcast.com/static/assets/css/forecast-accuracy-tool.css", "forecast-accuracy-css"),
        ]).then(() => loadModule("forecast-accuracy-tool.js", "forecast-accuracy"))
      );
    }

    // ---------- Mapbox pages ----------
    if (has('[data-script-loader="component.mapbox"]')) {
      tasks.push(
        Promise.all([
          loadExternalScript(mapboxCoreJS, "mapbox-gl"),
          loadExternalCSS(mapboxCoreCSS, "mapbox-css"),
          loadExternalCSS("https://solcast.com/static/assets/css/mapbox-gradients.css", "mapbox-gradients"),
          loadExternalCSS("https://solcast.com/static/assets/css/mapbox-styles.css", "mapbox-styles"),
        ]).then(async () => {
          await loadModule("mapbox.config.lta.js", "mapbox-config");
          await loadModule("mapboxSetup.js", "mapbox-setup");
        })
      );
    }

    // ---------- Latest world map ----------
    if (has('[data-script-loader="component.worldmap"]')) {
      tasks.push(loadModule("component.worldmap.js", "worldmap"));
    }

    // ---------- Video embed ----------
    if (has('[data-script-loader="component.video-embed"]')) {
      tasks.push(loadModule("component.video-embed.js", "video-embed"));
    }

    // ---------- Other related products ----------
    if (has('[data-script-loader="component.other-related-products"]')) {
      tasks.push(loadModule("component.other-related-products.js", "other-products"));
    }

    // ---------- Latest Solar Video ----------
    if (has('[data-script-loader="component.latest-video"]')) {
      tasks.push(loadModule("component.latest-video.js", "latest-video"));
    }

    // ---------- DatawrapperGraph embeds ----------
    if (has(".embed-graph")) {
      tasks.push(loadModule("component.dw-graph.js", "graph"));
    }
       
    // ---------- Map-box Solar Anomaly ----------
    if (has('[data-script-loader="component.map-box"]')) {
      tasks.push(loadMapStoryWidget());
    }

    // ---------- Per-page modules ----------

    // ---------- Pricing Page ----------
    if (path.includes("/pricing/")) {
      tasks.push(loadModule("page.pricing.js", "pricing"));
      tasks.push(loadModule("page.pricing.request-quote.js", "pricing-quote"));
    }

    // ---------- Quote Request Page ----------
    if (path.includes("/forms/requestaquote")) {
      tasks.push(loadModule("page.pricing.js", "pricing"));
      tasks.push(loadModule("page.pricing.request-quote.js", "pricing-quote"));
    }

    // ---------- Blog Template Pages ----------
    if (path.includes("/blog/")) {
      loadExternalScript("https://cdn.jsdelivr.net/npm/@flowbase-co/boosters-social-share@1.0.0/dist/social-share.min.js", "Social Sharing"),
      loadExternalScript("https://cdn.jsdelivr.net/npm/@finsweet/attributes-toc@1/toc.js", "Table of Contents"),
      tasks.push(loadModule("page.blog-template.js", "Blog Template Page"));
    }

    // ---------- Search Page ----------
    if (path.includes("/search")) {
      tasks.push(loadModule("page.search.js", "search"));
    }

    if (tasks.length) {
      await Promise.allSettled(tasks);
    }

    if ("requestIdleCallback" in window) {
      requestIdleCallback(
        () => {
          // idle tasks placeholder
        },
        { timeout: 1000 }
      );
    }
  });
})();
