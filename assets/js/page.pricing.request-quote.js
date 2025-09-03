// component.quote-links.js
let initialized = false;

export default function initQuoteLinks() {
  if (initialized) return;
  initialized = true;

  // -----------------------------------------
  // 1) Plan mappings (labels + slugs)
  //    Keys are internal shorthands; select uses human-readable labels.
  // -----------------------------------------
  const planMappings = {
    forecast: [
      { label: "Starter", slug: "starter" },
      { label: "Pro",     slug: "pro"     },
      { label: "Max",     slug: "max"     },
      { label: "Custom",  slug: "custom"  },
      { label: "I'm not sure yet", slug: "unsure" }
    ],
    hts: [
      { label: "Starter", slug: "starter" },
      { label: "Pro",     slug: "pro"     },
      { label: "Max",     slug: "max"     },
      { label: "Custom",  slug: "custom"  },
      { label: "I'm not sure yet", slug: "unsure" }
    ],
    tmy: [
      { label: "TMY Pro",          slug: "tmy-pro" },
      { label: "TMY Max",          slug: "tmy-max" },
      { label: "Site-Adapted TMY", slug: "site-adapted-tmy" },
      { label: "I'm not sure yet", slug: "unsure" }
    ],
    solar: [
      { label: "Rooftop PV Power Forecast Model",  slug: "rooftop-pv-power" },
      { label: "Advanced PV Power Forecast Model", slug: "adv-pv-power" },
      { label: "Premium PV Power Forecast Model",  slug: "premium-pv-power" },
      { label: "Premium PV Power: Additional Options", slug: "custom" },
      { label: "I'm not sure yet", slug: "unsure" }
    ],
    wind: [
      { label: "Premium Wind Power", slug: "premium" },
      { label: "Custom",             slug: "custom"  },
      { label: "I'm not sure yet",   slug: "unsure"  }
    ],
    "market-portfolio": [
      { label: "Load Forecasts",            slug: "load-forecast" },
      { label: "Portfolio Forecast Models", slug: "portfolio-power-models" },
      { label: "Market Forecasts Models",    slug: "market-power-models" },
      { label: "Custom",                    slug: "custom" },
      { label: "I'm not sure yet",          slug: "unsure" }
    ],
    "I'm not sure yet": [
      { label: "I'm not sure yet", slug: "unsure" }
    ]
  };

  // Alias "live" to use the same plans as "forecast"
  planMappings.live = planMappings.forecast;

  // -----------------------------------------
  // 2) Product mapping
  //    A) URL value -> exact <select> option value (human label)
  //    B) Selected <select> option value -> internal key for planMappings
  // -----------------------------------------
  const norm = (s) => (s || "").toString().trim().toLowerCase();

  // Exact option values present in your <select id="product_type">
  const SELECT_LABELS = {
    LIVE:  "Live and Forecast: -7 to +14 days",
    HTS:   "Time Series: 2007 to -7 days ago",
    TMY:   "TMY (Typical Meteorological Year)",
    SOLAR: "Solar Power Models",
    WIND:  "Wind Power Models",
    MKT:   "Markets, Portfolios and Grid models",
    UNSURE:"I'm not sure yet",
  };

  // A) Map various URL inputs to the exact select option value
  function mapUrlProductToSelectValue(urlValue) {
    if (!urlValue) return null;
    const s = norm(urlValue);

    // If it already matches one of the select labels (case-insensitive on text), accept as-is
    const allLabels = Object.values(SELECT_LABELS);
    for (const label of allLabels) {
      if (norm(label) === s) return label;
    }

    // Accept common shorthands / fragments
    // Prefer head term before colon if present
    const head = s.split(":")[0].trim();

    if (head.includes("live"))       return SELECT_LABELS.LIVE;
    if (head.includes("forecast"))   return SELECT_LABELS.LIVE; // "Live and Forecast"
    if (head.includes("time series") || head.includes("time-series") || head.includes("historical"))
                                   return SELECT_LABELS.HTS;
    if (head.includes("tmy") || head.includes("typical meteorological year"))
                                   return SELECT_LABELS.TMY;
    if (head.includes("solar"))     return SELECT_LABELS.SOLAR;
    if (head.includes("wind"))      return SELECT_LABELS.WIND;
    if (head.includes("market") || head.includes("portfolio") || head.includes("grid"))
                                   return SELECT_LABELS.MKT;
    if (head.includes("not sure"))  return SELECT_LABELS.UNSURE;

    // Also accept very short keys directly
    if (s === "live")               return SELECT_LABELS.LIVE;
    if (s === "forecast")           return SELECT_LABELS.LIVE;
    if (s === "hts")                return SELECT_LABELS.HTS;
    if (s === "tmy")                return SELECT_LABELS.TMY;
    if (s === "solar")              return SELECT_LABELS.SOLAR;
    if (s === "wind")               return SELECT_LABELS.WIND;
    if (s === "market-portfolio" || s === "market" || s === "markets")
                                   return SELECT_LABELS.MKT;
    if (s === "i'm not sure yet" || s === "unsure")
                                   return SELECT_LABELS.UNSURE;

    return null;
  }

  // B) Map the selected option value (label) to internal key for planMappings
  function productKeyFromSelectValue(selectValue) {
    const v = norm(selectValue);
    if (v === norm(SELECT_LABELS.LIVE))   return "live";
    if (v === norm(SELECT_LABELS.HTS))    return "hts";
    if (v === norm(SELECT_LABELS.TMY))    return "tmy";
    if (v === norm(SELECT_LABELS.SOLAR))  return "solar";
    if (v === norm(SELECT_LABELS.WIND))   return "wind";
    if (v === norm(SELECT_LABELS.MKT))    return "market-portfolio";
    if (v === norm(SELECT_LABELS.UNSURE)) return "I'm not sure yet";
    return null;
  }

  // -----------------------------------------
  // 3) Helpers for form behaviour
  // -----------------------------------------
  function normalizePlan(entry) {
    if (typeof entry === "string") {
      return { label: entry, slug: entry.toLowerCase().replace(/\s+/g, "-") };
    }
    if (entry && typeof entry === "object") {
      return { label: entry.label, slug: entry.slug };
    }
    return { label: "I'm not sure yet", slug: "unsure" };
  }

  // Case-insensitive setter for <select> based on value or visible text
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
  function togglePlanRow(selectedTypeValue, planRowEl, productPlanEl) {
    if (!planRowEl) return;
    const isUnsure = norm(selectedTypeValue) === norm(SELECT_LABELS.UNSURE);

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

  // Populate #product_plan based on the SELECTED option value in #product_type
  function updatePlans(productTypeEl, productPlanEl, planRowEl) {
    if (!productTypeEl || !productPlanEl) return;

    const selectedLabel = productTypeEl.value;                // human label from <option value="...">
    const productKey    = productKeyFromSelectValue(selectedLabel) || "I'm not sure yet";

    togglePlanRow(selectedLabel, planRowEl, productPlanEl);

    const rawPlans = planMappings[productKey] ?? ["I'm not sure yet"];
    const plans = rawPlans.map(normalizePlan);

    const prev = productPlanEl.value;
    productPlanEl.innerHTML = "";

    plans.forEach(({ label, slug }) => {
      const opt = document.createElement("option");
      opt.value = slug;        // query slug
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

  // -----------------------------------------
  // 4) Init: read URL (?product=, ?plan=)
  //    Map ?product= (shorthand or long) to the EXACT select label.
  //    Then populate plans and try to set ?plan= by slug or label.
  // -----------------------------------------
  (function initFormAutoselect() {
    const productType = document.getElementById("product_type");
    const productPlan = document.getElementById("product_plan");
    const planRowEl   = productPlan?.closest(".form_row");
    if (!productType || !productPlan || !planRowEl) return;

    const params = new URLSearchParams(window.location.search);
    const urlProduct = params.get("product");
    const urlPlan    = params.get("plan");

    // Compute the exact select label from the URL product
    const mappedSelectValue = mapUrlProductToSelectValue(urlProduct);

    if (mappedSelectValue) {
      // Set by exact option value
      setSelectValue(productType, mappedSelectValue);
    } else if (urlProduct) {
      // If the URL product already equals an option's label, this will also work
      setSelectValue(productType, urlProduct);
    }

    // Populate plans for the selected product
    updatePlans(productType, productPlan, planRowEl);

    // Try to set plan from URL (matches either slug or visible label)
    if (urlPlan) {
      setSelectValue(productPlan, urlPlan);
    }

    // Keep plans in sync if product changes
    productType.addEventListener("change", () =>
      updatePlans(productType, productPlan, planRowEl)
    );
  })();

  // -----------------------------------------
  // 5) Quote buttons:
  //    Write the *card's* data-qrf-* directly to the URL (no mapping).
  // -----------------------------------------
  const BTN_SELECTOR = 'a[data-listener="btn-request-quote"]';
  const PROCESSED_ATTR = 'data-quote-init';

  document.querySelectorAll(BTN_SELECTOR).forEach((button) => {
    if (button.getAttribute(PROCESSED_ATTR) === "1") return;
    button.setAttribute(PROCESSED_ATTR, "1");

    button.addEventListener("click", (e) => {
      const card = button.closest(".pricing_pane-card");
      if (!card) return;

      const product = card.getAttribute("data-qrf-product") || "";
      const plan    = card.getAttribute("data-qrf-plan") || "";

      const href = button.getAttribute("href") || "/";
      if (!product || !plan) return; // let default navigation happen if missing

      try {
        const url = new URL(href, window.location.origin);
        url.searchParams.set("product", product);
        url.searchParams.set("plan", plan);
        e.preventDefault();
        window.location.href = `${url.pathname}${url.search}${url.hash}`;
      } catch {
        // invalid href — default navigation
      }
    });
  });
}
  