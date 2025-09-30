// component.form-preselects.js
// ---------------------------------------------
// This module auto-preselects <select> elements
// that carry the attribute data-preselect="...".
//
// - Multiple selects are supported on the same page
// - The attribute value can match either an option's
//   value OR its visible text (case-insensitive)
// - Dispatches `input` and `change` so any listeners fire
// - Retries briefly to handle Webflow/async hydration
// - Safe to run multiple times (idempotent)
// ---------------------------------------------

let initialized = false;

export default function initFormPreselects() {
  if (initialized) return; // prevent double init
  initialized = true;

  const ATTR = 'data-preselect';       // attribute used on selects
  const DONE = 'data-preselected';     // internal marker so we don't re-run

  // --- Utility: normalize a string for case-insensitive comparisons
  const norm = (s) => (s || '').toString().trim().toLowerCase();

  // --- Find an <option> that matches the desired value or text
  function findMatchingOption(select, desiredRaw) {
    if (!desiredRaw) return null;
    const desired = norm(desiredRaw);

    // 1) Match against option.value
    for (const opt of select.options) {
      if (norm(opt.value) === desired) return opt;
    }
    // 2) Match against visible option text
    for (const opt of select.options) {
      if (norm(opt.textContent) === desired) return opt;
    }
    return null; // no match found
  }

  // --- Try to apply preselect to one <select>
  function applyPreselect(select) {
    if (!select || select.getAttribute(DONE) === '1') return true;

    const desired = select.getAttribute(ATTR);
    if (!desired) return false;

    const match = findMatchingOption(select, desired);
    if (!match) return false;

    // Only change if not already selected
    if (select.value !== match.value) {
      select.value = match.value;
      // Fire events so any listeners (e.g. validation, UI) run
      select.dispatchEvent(new Event('input',  { bubbles: true }));
      select.dispatchEvent(new Event('change', { bubbles: true }));
    }

    // Mark this select as done so we don't try again
    select.setAttribute(DONE, '1');
    return true;
  }

  // --- Retry mechanism for Webflow/dynamic hydration
  function attemptWhenReady(select) {
    // Try immediately
    if (applyPreselect(select)) return;

    // Retry up to 20 times (~3s at 150ms interval)
    let tries = 0;
    const MAX_TRIES = 20;
    const id = setInterval(() => {
      tries += 1;
      if (applyPreselect(select) || tries >= MAX_TRIES) {
        clearInterval(id);
      }
    }, 150);
  }

  // --- Scan a DOM root for any <select data-preselect="...">
  function scan(root = document) {
    root.querySelectorAll(`select[${ATTR}]`).forEach(attemptWhenReady);
  }

  // --- Initial run (DOM ready or immediately if already loaded)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => scan(), { once: true });
  } else {
    scan();
  }

  // --- Observe for dynamically inserted selects (Webflow re-renders, etc.)
  const obs = new MutationObserver((muts) => {
    for (const m of muts) {
      if (m.type !== 'childList' || !m.addedNodes?.length) continue;
      m.addedNodes.forEach((node) => {
        if (!(node instanceof Element)) return;

        // If the added node itself is a target select
        if (node.matches?.(`select[${ATTR}]`)) {
          attemptWhenReady(node);
        } else {
          // Or if it contains one inside its subtree
          const any = node.querySelector?.(`select[${ATTR}]`);
          if (any) scan(node);
        }
      });
    }
  });
  obs.observe(document.documentElement, { subtree: true, childList: true });
}
