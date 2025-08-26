// recaptcha-per-form.strict.js
// Only affects forms that CONTAIN a .g-recaptcha element.

(function () {
  const RECAPTCHA_SELECTOR = '.g-recaptcha';
  const RESPONSE_SELECTOR  = 'textarea.g-recaptcha-response';
  const POLL_MS = 400;

  // Map<form, { button: HTMLElement|null, lastSolved: boolean, pollId: number|null }>
  const formState = new Map();

  const disableBtn = (btn) => {
    if (!btn) return;
    btn.classList.add('is-disabled');
    btn.setAttribute('disabled', 'disabled');
  };

  const enableBtn = (btn) => {
    if (!btn) return;
    btn.classList.remove('is-disabled');
    btn.removeAttribute('disabled');
  };

  // True if any reCAPTCHA response textarea in the form has a non-empty value
  function formCaptchaSolved(form) {
    const responses = form.querySelectorAll(RESPONSE_SELECTOR);
    for (const ta of responses) {
      const val = (ta && typeof ta.value === 'string') ? ta.value.trim() : '';
      if (val.length > 0) return true;
    }
    return false;
  }

  function wireSubmitGuard(form) {
    if (form.dataset._rc_guard === '1') return;
    form.dataset._rc_guard = '1';
    form.addEventListener('submit', (e) => {
      if (!formCaptchaSolved(form)) {
        e.preventDefault();
        const state = formState.get(form);
        disableBtn(state?.button);
      }
    });
  }

  function startPoll(form) {
    const state = formState.get(form);
    if (!state) return;
    if (state.pollId) clearInterval(state.pollId);

    const evaluate = () => {
      const solved = formCaptchaSolved(form);
      if (solved !== state.lastSolved) {
        state.lastSolved = solved;
        if (solved) enableBtn(state.button);
        else disableBtn(state.button);
      }
    };

    // Initial state & toggle
    state.lastSolved = formCaptchaSolved(form);
    if (state.lastSolved) enableBtn(state.button);
    else disableBtn(state.button);

    state.pollId = setInterval(evaluate, POLL_MS);
  }

  function wireFormForRecaptchaContainer(container) {
    const form = container.closest('form');
    if (!form || formState.has(form)) return;

    const button = form.querySelector('button[type="submit"], input[type="submit"]');
    formState.set(form, { button, lastSolved: false, pollId: null });

    wireSubmitGuard(form);
    startPoll(form);
  }

  function scanRecaptchaContainers() {
    document.querySelectorAll(RECAPTCHA_SELECTOR).forEach(wireFormForRecaptchaContainer);
  }

  function init() {
    scanRecaptchaContainers();

    // Watch only for new .g-recaptcha nodes (not all forms)
    const mo = new MutationObserver((muts) => {
      for (const m of muts) {
        if (m.type === 'childList' && m.addedNodes?.length) {
          m.addedNodes.forEach((n) => {
            if (n.nodeType !== 1) return;
            if (n.matches?.(RECAPTCHA_SELECTOR)) wireFormForRecaptchaContainer(n);
            else {
              const found = n.querySelector?.(RECAPTCHA_SELECTOR);
              if (found) wireFormForRecaptchaContainer(found);
            }
          });
        }
      }
    });
    mo.observe(document.documentElement, { childList: true, subtree: true });
  }

  // Global callbacks for data-callback / data-expired-callback in markup
  window.onCaptchaSuccess = function () {
    formState.forEach((state, form) => {
      if (form.querySelector(RECAPTCHA_SELECTOR)) {
        if (formCaptchaSolved(form)) enableBtn(state.button);
      }
    });
  };

  window.onCaptchaExpired = function () {
    formState.forEach((state, form) => {
      if (!formCaptchaSolved(form)) disableBtn(state.button);
    });
  };

  // Optional manual refresh if forms/captchas are injected dynamically
  window.refreshRecaptchaPerFormStrict = function () {
    scanRecaptchaContainers();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

