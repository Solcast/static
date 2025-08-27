// component.quote-links.js
let initialized = false;

export default function initQuoteLinks() {
  if (initialized) return;
  initialized = true;

  // -----------------------------------------
  // 1) Plan mappings (labels + slugs)
  //    Keys must match #product_type option values
  // -----------------------------------------
  const planMappings = {
    "forecast": [
      { label: "Starter", slug: "starter" },
      { label: "Pro",     slug: "pro"     },
      { label: "Max",     slug: "max"     },
      { label: "Custom",  slug: "custom"  },
      { label: "I'm not sure yet", slug: "unsure" }
    ],
    "hts": [
      { label: "Starter", slug: "starter" },
      { label: "Pro",     slug: "pro"     },
      { label: "Max",     slug: "max"     },
      { label: "Custom",  slug: "custom"  },
      { label: "I'm not sure yet", slug: "unsure" }
    ],
    "tmy": [
      { label: "TMY Pro",          slug: "tmy-pro" },
      { label: "TMY Max",          slug: "tmy-max" },
      { label: "Site-Adapted TMY", slug: "site-adapted-tmy" },
      { label: "I'm not sure yet", slug: "unsure" }
    ],
    // NOTE: "live" will be aliased to "forecast" below (Option 1)
    "solar": [
      { label: "Rooftop PV Power Forecast Model",  slug: "rooftop-pv-power" },
      { label: "Advanced PV Power Forecast Model", slug: "adv-pv-power" },
      { label: "Premium PV Power Forecast Model",  slug: "premium-pv-power" },
      { label: "Premium PV Power: Additional Options", slug: "custom" },
      { label: "I'm not sure yet", slug: "unsure" }
    ],
    "wind": [
      { label: "Premium Wind Power", slug: "premium" },
      { label: "Custom",             slug: "custom"  },
      { label: "I'm not sure yet",   slug: "unsure"  }
    ],
    "market-portfolio": [
      { label: "Load Forecasts",            slug: "load-forecast" },
      { label: "Portfolio Forecast Models", slug: "portfolio-power-models" },
      { label: "Market Forecast Models",    slug: "market-power-models" },
      { label: "Custom",                    slug: "custom" },
      { label: "I'm not sure yet",          slug: "unsure" }
    ],
    "I'm not sure yet": [
      { label: "I'm not sure yet", slug: "unsure" }
    ]
  };

  // ---- Option 1: alias "live" to share the exact array used by "forecast"
  planMappings["live"] = planMappings["forecast"];

  // -----------------------------------------
  // 2) Synonyms for ?product= (optional)
  //    Map common labels/old values -> mapping keys above
  // -----------------------------------------
  const productSynonyms = new Map([
    ["power models", "solar"],
    ["solar power models", "solar"],
    ["wind power models", "wind"],
    ["markets, portfolios and grid models", "market-portfolio"],
    ["market-portfolios", "market-portfolio"],
    ["time-series", "hts"],
    ["historical", "hts"],
    ["live-data", "live"] // still resolves to "live" (which is aliased to "forecast")
  ]);

  // -----------------------------------------
  // 3) Utilities
  // -----------------------------------------
  const norm = (s) => (s || "").toString().trim().toLowerCase();

  function normalizePlan(entry) {
    if (typeof entry === "string") {
      return { label: entry, slug: entry.toLowerCase().replace(/\s+/g, "-") };
    }
    if (entry && typeof entry === "object") {
      return { label: entry.label, slug: entry.slug };
    }
    return { label: "I'm not sure yet", slug: "unsure" };
  }

  // Case-insensitive setter for <select> based on value or text
  function setSelectValue(selectEl, desiredValue) {
    if (!selectEl || !desiredValue) return false;
    const want = norm(desiredValue);
    for (const opt of selectEl.options) {
      if (norm(opt.value) === want) { selectEl.value = opt.value; return true; }
    }
    for (const opt of selectEl.options) {
      if (norm(opt.textContent) === want) { selectEl.value = opt.value; return true; }
    }
    return false;
  }

  // Show/hide the plan row (remember original display and required)
  function togglePlanRow(selectedType, planRowEl, productPlanEl) {
    if (!planRowEl) return;
    const isUnsure = norm(selectedType) === norm("I'm not sure yet");

    if (!planRowEl.dataset.originalDisplay) {
      const computed = window.getComputedStyle(planRowEl).display;
      planRowEl.dataset.originalDisplay = computed && computed !== "none" ? computed : "block";
    }

    if (isUnsure) {
      planRowEl.style.display = "none";
      if (productPlanEl) {
        if (!productPlanEl.dataset.wasRequired) {
          productPlanEl.dataset.wasRequired = productPlanEl.required ? "1" : "0";
        }
        productPlanEl.required = false;
      }
    } else {
      planRowEl.style.display = planRowEl.dataset.originalDisplay || "block";
      if (productPlanEl && productPlanEl.dataset.wasRequired !== "0") {
        productPlanEl.required = true;
      }
    }
  }

  // Populate #product_plan based on current #product_type
  function updatePlans(productTypeEl, productPlanEl, planRowEl) {
    if (!productTypeEl || !productPlanEl) return;

    const selectedType = productTypeEl.value;

    togglePlanRow(selectedType, planRowEl, productPlanEl);

    const rawPlans = planMappings[selectedType] ?? ["I'm not sure yet"];
    const plans = rawPlans.map(normalizePlan);

    const prev = productPlanEl.value;

    productPlanEl.innerHTML = "";
    plans.forEach(({ label, slug }) => {
      const opt = document.createElement("option");
      opt.value = slug;        // goes into URL/query
      opt.textContent = label; // visible text
      opt.dataset.label = label;
      productPlanEl.appendChild(opt);
    });

    if (plans.some(p => p.slug === prev)) {
      productPlanEl.value = prev;
    } else {
      productPlanEl.value = plans[0]?.slug ?? "";
    }
  }

  // Resolve ?product= against #product_type (values, labels, or synonyms)
  function resolveProductValue(productRaw, productTypeEl) {
    if (!productTypeEl || !productRaw) return null;
    const want = norm(productRaw);

    for (const opt of productTypeEl.options) {
      if (norm(opt.value) === want) return opt.value;
    }
    for (const opt of productTypeEl.options) {
      if (norm(opt.textContent) === want) return opt.value;
    }
    if (productSynonyms.has(want)) return productSynonyms.get(want);

    return null;
  }

  // -----------------------------------------
  // 4) Init: auto-select from URL and wire up change handlers
  // -----------------------------------------
  (function initFormAutoselect() {
    const productType = document.getElementById("product_type");
    const productPlan = document.getElementById("product_plan");
    const planRowEl   = productPlan?.closest(".form_row");
    if (!productType || !productPlan || !planRowEl) return;

    const params = new URLSearchParams(window.location.search);
    const urlProduct = params.get("product");
    const urlPlan    = params.get("plan");

    const resolvedProduct = resolveProductValue(urlProduct, productType);
    if (resolvedProduct) productType.value = resolvedProduct;

    updatePlans(productType, productPlan, planRowEl);

    if (urlPlan) {
      // Match by slug (option.value) or label
      setSelectValue(productPlan, urlPlan);
    }

    productType.addEventListener("change", () =>
      updatePlans(productType, productPlan, planRowEl)
    );
  })();

  // -----------------------------------------
  // 5) Quote buttons: prefer nearest form values, fallback to data-*
  // -----------------------------------------
  const BTN_SELECTOR = 'a[data-listener="btn-request-quote"]';
  const PROCESSED_ATTR = 'data-quote-init';

  document.querySelectorAll(BTN_SELECTOR).forEach((button) => {
    if (button.getAttribute(PROCESSED_ATTR) === '1') return;
    button.setAttribute(PROCESSED_ATTR, '1');

    button.addEventListener('click', (e) => {
      const form = button.closest('form');
      const formProduct = form?.querySelector('#product_type')?.value || null;
      const formPlan    = form?.querySelector('#product_plan')?.value || null;

      const product = formProduct || button.dataset.gtmProduct || null;
      const plan    = formPlan    || button.dataset.gtmPlan    || null;

      const href = button.getAttribute('href') || '/';
      if (!product || !plan) return; // fall through to normal nav

      try {
        const url = new URL(href, window.location.origin);
        url.searchParams.set('product', product); // product_type value
        url.searchParams.set('plan', plan);       // plan slug
        e.preventDefault();
        window.location.href = `${url.pathname}${url.search}${url.hash}`;
      } catch {
        // invalid href — default navigation
      }
    });
  });
}
