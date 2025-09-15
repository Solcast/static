// page.pricing.request-quote.js
// Product/plan behavior for pricing & request-a-quote pages.
//
// - Intercepts <a data-listener="btn-request-quote"> and appends ?product=&plan=
// - Preselects #product_type
// - Shows/enables only the correct plan <select>. Others stay hidden by CSS and disabled.
// - Hides the whole plan row if "I'm not sure yet"
// - Supports deep links (?product=&plan=) and manual changes

export default function initQuoteLinks() {
  if (window.__qrfQuoteLinksInit__) return;
  window.__qrfQuoteLinksInit__ = true;

  const BTN_SELECTOR = 'a[data-listener="btn-request-quote"]';
  const PLAN_ROW_SELECTOR = '.form_row.is-plan';
  const PLAN_SELECT_SELECTOR = 'select.is-qrf-plan[name="product_plan"]';

  const productSel = /** @type {HTMLSelectElement|null} */ (document.getElementById('product_type'));
  const planRow = /** @type {HTMLElement|null} */ (document.querySelector(PLAN_ROW_SELECTOR));
  const planSelects = planRow ? /** @type {HTMLSelectElement[]} */ ([...planRow.querySelectorAll(PLAN_SELECT_SELECTOR)]) : [];

  const planById = new Map(planSelects.map(s => [s.id, s]));

  // --- helpers ---
  const normalizeWS = (s) => (s ?? '').toString().trim().replace(/\s+/g, ' ');

  const productLabelToPlanId = (labelRaw) => {
    let s = normalizeWS(labelRaw);
    s = s.replace(/[–—]/g, '-');          // normalize fancy dashes
    s = s.replace(/[^A-Za-z0-9\s-]/g, ''); // strip punctuation
    s = s.replace(/\s+/g, '-');            // spaces -> hyphens
    return s;
  };

  const setSelectValue = (selectEl, valueRaw) => {
    if (!selectEl) return false;
    const v = normalizeWS(valueRaw);
    if (!v) return false;
    let opt = [...selectEl.options].find(o => o.value === v);
    if (!opt) {
      const vLower = v.toLowerCase();
      opt = [...selectEl.options].find(
        o => normalizeWS(o.value).toLowerCase() === vLower ||
             normalizeWS(o.textContent).toLowerCase() === vLower
      );
    }
    if (opt) {
      selectEl.value = opt.value;
      selectEl.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    }
    return false;
  };

  const hideAllPlans = () => {
    for (const s of planSelects) {
      s.disabled = true;
      s.required = false;
      s.style.display = 'none';
      s.setAttribute('aria-hidden', 'true');
      s.selectedIndex = 0;
    }
  };

  const revealPlanForProduct = (productLabel) => {
    if (!planRow || !planSelects.length) return;
    const label = normalizeWS(productLabel);

    if (!label) {
      planRow.style.display = '';
      hideAllPlans();
      return;
    }

    if (label.toLowerCase() === "i'm not sure yet") {
      planRow.style.display = 'none';
      hideAllPlans();
      return;
    }

    planRow.style.display = '';
    hideAllPlans();

    const wantedId = productLabelToPlanId(label);
    const target = planById.get(wantedId);

    if (target) {
      target.disabled = false;
      target.required = true;
      target.style.display = 'block';
      target.setAttribute('aria-hidden', 'false');
    } else {
      // fallback: show all if no exact match
      for (const s of planSelects) {
        s.disabled = false;
        s.required = false;
        s.style.display = 'block';
        s.setAttribute('aria-hidden', 'false');
      }
    }
  };

  const applyPlanIfVisible = (planRaw) => {
    if (!planRow || !planRaw) return false;
    const visible = /** @type {HTMLSelectElement|null} */ (planRow.querySelector(`${PLAN_SELECT_SELECTOR}:not([disabled])`));
    return visible ? setSelectValue(visible, planRaw) : false;
  };

  // --- A) Click handler for pricing cards ---
  document.addEventListener('click', (evt) => {
    const anchor = evt.target && /** @type {HTMLElement} */ (evt.target).closest?.(BTN_SELECTOR);
    if (!anchor) return;

    const card = /** @type {HTMLElement|null} */ (anchor.closest('[data-qrf-product][data-qrf-plan]'));
    const product = card?.getAttribute('data-qrf-product');
    const plan = card?.getAttribute('data-qrf-plan');
    if (!product || !plan) return;

    let url;
    try {
      url = new URL(anchor.getAttribute('href') || '/', window.location.origin);
    } catch {
      return;
    }
    url.searchParams.set('product', product);
    url.searchParams.set('plan', plan);

    if (productSel) setSelectValue(productSel, product);
    revealPlanForProduct(product);
    applyPlanIfVisible(plan);

    evt.preventDefault();
    const target = (anchor.getAttribute('target') || '').toLowerCase();
    if (target === '_blank') {
      window.open(url.toString(), '_blank', 'noopener,noreferrer');
    } else {
      const sameOrigin = url.origin === window.location.origin;
      const next = sameOrigin ? (url.pathname + url.search + url.hash) : url.toString();
      window.location.href = next;
    }
  }, { capture: true });

  // --- B) Deep link support (?product=&plan=) ---
  const params = new URLSearchParams(window.location.search);
  const productParam = params.get('product');
  const planParam = params.get('plan');

  const initFromParams = () => {
    if (productParam && productSel) setSelectValue(productSel, productParam);
    revealPlanForProduct(productParam || productSel?.value || '');
    if (planParam) applyPlanIfVisible(planParam);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFromParams, { once: true });
  } else {
    initFromParams();
  }

  // --- C) Manual product select changes ---
  productSel?.addEventListener('change', (e) => {
    const product = /** @type {HTMLSelectElement} */ (e.currentTarget).value;
    revealPlanForProduct(product);
    const visible = /** @type {HTMLSelectElement|null} */ (planRow?.querySelector(`${PLAN_SELECT_SELECTOR}:not([disabled])`));
    if (visible && !visible.value && visible.options.length) {
      visible.selectedIndex = 0;
      visible.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
}
