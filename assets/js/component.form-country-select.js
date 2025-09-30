// component.disable-country-placeholder.js
// ---------------------------------------------
// Loads Finsweet Attributes, then disables the first <option> in all
// <select> elements with data-select-type="country". The placeholder
// stays visible but cannot be chosen.
// - Safe if there are zero, one, or many matching selects
// - Idempotent (marks processed selects)
// - Watches the DOM for selects added later (MutationObserver)
// ---------------------------------------------

// Inject Finsweet Attributes script into DOM (once)
(function loadFinsweetAttributes() {
  // Guard against duplicate injections from other components
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
  // Add fs-list boolean attribute
  s.setAttribute("fs-list", "");
  document.head.appendChild(s);
  window.__fsAttributesInjected__ = true;
})();

let initialized = false;
let observer = null;

export default function initDisableCountryPlaceholder() {
  if (initialized) return;
  initialized = true;

  const SELECTOR = 'select[data-select-type="country"]';
  const MARK = "data-placeholder-disabled"; // internal marker to avoid rework

  // Disable the first option of a single select (safe + idempotent)
  const applyToSelect = (select) => {
    if (!select || select.nodeName !== "SELECT") return;
    if (select.hasAttribute(MARK)) return;

    const firstOption = select.options && select.options[0];
    if (!firstOption) return;

    firstOption.disabled = true;          // prevent choosing it
    firstOption.style.color = "#888888";  // grey out text

    select.setAttribute(MARK, "1");
  };

  // Process all current matches
  const processAll = () => {
    const list = document.querySelectorAll(SELECTOR);
    if (!list || list.length === 0) return; // gracefully handle "none on page"
    list.forEach(applyToSelect);
  };

  processAll();

  // Watch for selects that appear later (e.g., CMS renders / dynamic inserts)
  if (!observer) {
    observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        // Newly added nodes
        m.addedNodes.forEach((node) => {
          if (node.nodeType !== 1) return;

          // If the node itself is a target select
          if (node.matches && node.matches(SELECTOR)) {
            applyToSelect(node);
          }

          // Or if it contains target selects
          const nested = node.querySelectorAll ? node.querySelectorAll(SELECTOR) : [];
          nested.forEach(applyToSelect);
        });
      }
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  }
}
