/* --- Blog Template Scripts --- */

// Seach Box

let __blogSearchInitialised = false;

export default function initBlogSearch(opts = {}) {
  if (__blogSearchInitialised) return;
  __blogSearchInitialised = true;

  const DEBUG = opts.debug === true;
  const log = DEBUG ? (...a) => console.log('[blog-search]', ...a) : () => {};

  // ---- Grab elements (single-pass) ----------------------------------------
  const form = document.getElementById('wf-form-Search-Box');
  const input = document.getElementById('search');
  const submitBtn = document.getElementById('blog-search');
  const wrapper = form && form.closest ? form.closest('.w-form') : null;

  if (!form || !input) return; // nothing to do

  // ---- Minimal unlock (once) ----------------------------------------------
  const enableSubmit = (reason) => {
    if (submitBtn) {
      if (submitBtn.disabled) submitBtn.disabled = false;
      if (submitBtn.hasAttribute('disabled')) submitBtn.removeAttribute('disabled');
      if (submitBtn.classList.contains('w-form-loading')) submitBtn.classList.remove('w-form-loading');
      if (submitBtn.classList.contains('is-disabled')) submitBtn.classList.remove('is-disabled');
    }
    if (wrapper && wrapper.classList.contains('w-form-loading')) wrapper.classList.remove('w-form-loading');
    log('submit enabled', reason || '');
  };

  enableSubmit('initial');

  // ---- Lightweight Turnstile detection (bounded polling) ------------------
  // Checks for any input[name="cf-turnstile-response"] with a non-empty value.
  // Exponential backoff: 200ms → 400 → 800 → 1600 → 3200 (then stop).
  (function checkTurnstileToken(attempt = 0) {
    const tokens = form.querySelectorAll('input[name="cf-turnstile-response"]');
    let hasToken = false;
    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i].value && tokens[i].value.length > 0) { hasToken = true; break; }
    }
    if (hasToken) {
      enableSubmit('turnstile token');
      return; // done, no more work
    }
    if (attempt >= 4) return; // cap work ~5s worst case
    const delay = 200 * (2 ** attempt);
    setTimeout(() => checkTurnstileToken(attempt + 1), delay);
  })();

  // ---- Submit  ------------------------------------------------------------
  form.addEventListener('submit', (e) => {
    // Let browser handle "required" UI first
    const q = (input.value || '').trim();
    if (!q) return;

    // Avoid posting Turnstile fields / Webflow ajax: client-side GET redirect.
    e.preventDefault();
    try {
      const url = new URL('/blog', window.location.origin);
      url.searchParams.set('*', q);
      window.location.assign(url.toString());
    } catch {
      window.location.assign('/blog?*=' + encodeURIComponent(q));
    }
  }, { passive: false, once: false }); // keep listener, minimal options
}



//Hides Table of Contents if no H2 found
document.addEventListener("DOMContentLoaded", function() {
  setTimeout(function() {
    const tocElement = document.querySelector('.blog_summary-toc');
    const linkWrapper = tocElement.querySelector('.blog_summary-toc_link-wrapper.is-h2');

    if (linkWrapper && linkWrapper.textContent.trim() === "") {
      tocElement.style.display = "none";
    }
  }, 200);
});
