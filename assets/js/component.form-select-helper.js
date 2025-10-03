// component.form-helpers.js
// ---------------------------------------------
// Combined helpers for <select> elements:
//
// 1) Country placeholder guard + name sync
//    - Target: select[data-select-type="country"]
//    - Disables first option (placeholder) once
//    - Keeps `name` in sync with `data-name`
//
// 2) Generic preselect
//    - Target: select[data-preselect="..."]
//    - Matches option.value OR visible text (case-insensitive)
//    - Fires 'input' and 'change' on change
//    - Retries briefly to handle async hydration
//
// Also:
// - Injects Finsweet Attributes @2 once with fs-list
// - Watches DOM for added nodes and attribute changes
// ---------------------------------------------

// --- Finsweet Attributes injection (once)
(function loadFinsweetAttributes() {
  if (window.__fsAttributesInjected__) return;

  const existing = document.querySelector(
    'script[src*="@finsweet/attributes@2/attributes.js"]'
  );
  if (existing) {
    window.__fsAttributesInjected__ = true;
    return;
  }

  const s = document.createElement("script");
  s.type = "module";
  s.async = true;
  s.src = "https://cdn.jsdelivr.net/npm/@finsweet/attributes@2/attributes.js";
  s.setAttribute("fs-list", "");
  document.head.appendChild(s);
  window.__fsAttributesInjected__ = true;
})();

let initialized = false;
let observer = null;

// Public entry: run both helpers
export default function initFormHelpers() {
  if (initialized) return;
  initialized = true;

  // --- Config / selectors
  const COUNTRY_SELECTOR = 'select[data-select-type="country"]';
  const PLACEHOLDER_MARK = "data-placeholder-disabled"; // only for placeholder step
  const PRESELECT_ATTR = "data-preselect";
  const PRESELECT_DONE = "data-preselected"; // internal marker after success

  // --- Utility: normalize a string for case-insensitive comparisons
  const norm = (s) => (s || "").toString().trim().toLowerCase();

  // --- COUNTRY: keep `name` in sync with `data-name`
  const syncSelectName = (select) => {
    const dataName = select.getAttribute("data-name");
    if (dataName && select.getAttribute("name") !== dataName) {
      select.setAttribute("name", dataName);
    }
  };

  // --- COUNTRY: disable first option once (placeholder)
  const disablePlaceholderOnce = (select) => {
    if (select.hasAttribute(PLACEHOLDER_MARK)) return; // already handled
    const firstOption = select.options && select.options[0];
    if (firstOption) {
      firstOption.disabled = true;
      firstOption.style.color = "#888888"; // grey out for clarity
    }
    select.setAttribute(PLACEHOLDER_MARK, "1");
  };

  // --- COUNTRY: apply both behaviors to one select
  const applyCountryHelpers = (select) => {
    if (!select || select.nodeName !== "SELECT") return;
    syncSelectName(select);        // always re-sync
    disablePlaceholderOnce(select); // only once
  };

  // --- PRESELECT: find an option by value or text (case-insensitive)
  const findMatchingOption = (select, desiredRaw) => {
    if (!desiredRaw) return null;
    const desired = norm(desiredRaw);

    // 1) Match against option.value
    for (const opt of select.options) {
      if (norm(opt.value) === desired) return opt;
    }
    // 2) Match against visible text
    for (const opt of select.options) {
      if (norm(opt.textContent) === desired) return opt;
    }
    return null;
  };

  // --- PRESELECT: apply to one select
  const applyPreselect = (select) => {
    if (!select) return false;

    const desired = select.getAttribute(PRESELECT_ATTR);
    if (!desired) return false;

    // If marked done, only skip if current value already matches desired
    if (select.getAttribute(PRESELECT_DONE) === "1" && norm(select.value) === norm(desired)) {
      return true;
    }

    const match = findMatchingOption(select, desired);
    if (!match) return false;

    if (select.value !== match.value) {
      select.value = match.value;
      // Fire events so listeners (validation/UI) run
      select.dispatchEvent(new Event("input", { bubbles: true }));
      select.dispatchEvent(new Event("change", { bubbles: true }));
    }

    select.setAttribute(PRESELECT_DONE, "1");
    return true;
  };

  // --- PRESELECT: retry briefly for async hydration
  const attemptPreselectWhenReady = (select) => {
    if (applyPreselect(select)) return;

    let tries = 0;
    const MAX_TRIES = 20; // ~3s @150ms
    const id = setInterval(() => {
      tries += 1;
      if (applyPreselect(select) || tries >= MAX_TRIES) {
        clearInterval(id);
      }
    }, 150);
  };

  // --- SCAN: apply both systems in a DOM root
  const scan = (root = document) => {
    // Country helpers
    root.querySelectorAll(COUNTRY_SELECTOR).forEach(applyCountryHelpers);
    // Preselect helpers
    root.querySelectorAll(`select[${PRESELECT_ATTR}]`).forEach(attemptPreselectWhenReady);
  };

  // --- Initial run
  const run = () => scan(document);
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run, { once: true });
  } else {
    run();
  }

  // --- Observer: watch for new nodes and attribute changes
  if (!observer) {
    observer = new MutationObserver((muts) => {
      for (const m of muts) {
        // Attribute changes we care about:
        if (m.type === "attributes" && m.target instanceof Element) {
          // data-name changed on a country select -> re-sync name
          if (
            m.attributeName === "data-name" &&
            m.target.matches?.(COUNTRY_SELECTOR)
          ) {
            syncSelectName(m.target);
          }

          // data-preselect changed on a select -> (re)attempt preselect
          if (
            m.attributeName === PRESELECT_ATTR &&
            m.target.matches?.(`select[${PRESELECT_ATTR}]`)
          ) {
            attemptPreselectWhenReady(m.target);
          }
        }

        // Newly added nodes: apply helpers to them and their descendants
        if (m.type === "childList" && m.addedNodes?.length) {
          m.addedNodes.forEach((node) => {
            if (!(node instanceof Element)) return;

            // If node itself matches country selector
            if (node.matches?.(COUNTRY_SELECTOR)) {
              applyCountryHelpers(node);
            }
            // If node itself matches preselect selector
            if (node.matches?.(`select[${PRESELECT_ATTR}]`)) {
              attemptPreselectWhenReady(node);
            }

            // Nested matches
            const countries = node.querySelectorAll?.(COUNTRY_SELECTOR) || [];
            countries.forEach(applyCountryHelpers);

            const preselects = node.querySelectorAll?.(`select[${PRESELECT_ATTR}]`) || [];
            preselects.forEach(attemptPreselectWhenReady);
          });
        }
      }
    });

    observer.observe(document.documentElement, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["data-name", PRESELECT_ATTR],
    });
  }
}

// (Optional) Named exports if you ever need to trigger parts manually
export function initCountryHelpersManually(root = document) {
  const COUNTRY_SELECTOR = 'select[data-select-type="country"]';
  const PLACEHOLDER_MARK = "data-placeholder-disabled";

  const syncSelectName = (select) => {
    const dataName = select.getAttribute("data-name");
    if (dataName && select.getAttribute("name") !== dataName) {
      select.setAttribute("name", dataName);
    }
  };

  const disablePlaceholderOnce = (select) => {
    if (select.hasAttribute(PLACEHOLDER_MARK)) return;
    const firstOption = select.options && select.options[0];
    if (firstOption) {
      firstOption.disabled = true;
      firstOption.style.color = "#888888";
    }
    select.setAttribute(PLACEHOLDER_MARK, "1");
  };

  root.querySelectorAll(COUNTRY_SELECTOR).forEach((select) => {
    syncSelectName(select);
    disablePlaceholderOnce(select);
  });
}

export function initPreselectsManually(root = document) {
  const PRESELECT_ATTR = "data-preselect";
  const PRESELECT_DONE = "data-preselected";
  const norm = (s) => (s || "").toString().trim().toLowerCase();

  const findMatchingOption = (select, desiredRaw) => {
    if (!desiredRaw) return null;
    const desired = norm(desiredRaw);
    for (const opt of select.options) if (norm(opt.value) === desired) return opt;
    for (const opt of select.options) if (norm(opt.textContent) === desired) return opt;
    return null;
  };

  const applyPreselect = (select) => {
    const desired = select.getAttribute(PRESELECT_ATTR);
    if (!desired) return false;
    if (select.getAttribute(PRESELECT_DONE) === "1" && norm(select.value) === norm(desired)) {
      return true;
    }
    const match = findMatchingOption(select, desired);
    if (!match) return false;
    if (select.value !== match.value) {
      select.value = match.value;
      select.dispatchEvent(new Event("input", { bubbles: true }));
      select.dispatchEvent(new Event("change", { bubbles: true }));
    }
    select.setAttribute(PRESELECT_DONE, "1");
    return true;
  };

  root.querySelectorAll(`select[${PRESELECT_ATTR}]`).forEach((s) => {
    // Try immediately; if it fails, do a short retry loop
    if (applyPreselect(s)) return;
    let tries = 0;
    const id = setInterval(() => {
      tries += 1;
      if (applyPreselect(s) || tries >= 20) clearInterval(id);
    }, 150);
  });
}
