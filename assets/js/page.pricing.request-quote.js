// component.quote-links.js
let initialized = false;

export default function initQuoteLinks() {
  if (initialized) return;
  initialized = true;

  const SELECTOR = 'a[data-listener="btn-request-quote"]';
  const PROCESSED_ATTR = 'data-quote-init';

  document.querySelectorAll(SELECTOR).forEach((button) => {
    if (button.getAttribute(PROCESSED_ATTR) === '1') return;
    button.setAttribute(PROCESSED_ATTR, '1');

    button.addEventListener('click', (e) => {
      const product = button.dataset.gtmProduct;
      const plan    = button.dataset.gtmPlan;
      const href    = button.getAttribute('href') || '/';

      // If data is missing, let it behave like a normal link
      if (!product || !plan) return;

      try {
        const url = new URL(href, window.location.origin);
        url.searchParams.set('product', product);
        url.searchParams.set('plan', plan);

        // Rewrite navigation to the updated URL
        e.preventDefault();
        window.location.href = `${url.pathname}${url.search}${url.hash}`;
      } catch {
        // Invalid href — fall through to default navigation
      }
    });
  });
}
