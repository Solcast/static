// ***** Pricing Page Header Height. ***** //
// Adjusts the header of the pricing cards to be the same height.

export default function matchHeaderHeights() {
  const tabPanes = document.querySelectorAll('.pricing_table_tab-content-pane');

  if (!tabPanes.length) return;

  tabPanes.forEach(pane => {
    const headers = pane.querySelectorAll('.pricing_pane-card_header');
    if (!headers.length) return;

    // Set an initial height so they don't flash from 0
    headers.forEach(h => h.style.height = '230px');

    // Use requestAnimationFrame so the initial 230px renders, then recalc
    requestAnimationFrame(() => {
      // Reset to auto to measure correctly
      headers.forEach(h => h.style.height = 'auto');

      // Find tallest in this pane
      let maxHeight = 0;
      headers.forEach(h => {
        const hgt = h.offsetHeight;
        if (hgt > maxHeight) maxHeight = hgt;
      });

      // Apply calculated height
      headers.forEach(h => h.style.height = `${maxHeight}px`);
    });
  });
}

// Run on load & resize
window.addEventListener('load', matchHeaderHeights);
window.addEventListener('resize', matchHeaderHeights);

// Also re-run when tabs change in Webflow + update URL hash
document.addEventListener('click', e => {
  const tabLink = e.target.closest('.w-tab-link');
  if (tabLink) {
    // Update URL hash without reloading
    const tabName = tabLink.getAttribute('data-w-tab');
    if (tabName) {
      const newUrl = `${window.location.pathname}#${tabName}`;
      history.replaceState(null, '', newUrl);
    }

    // Set initial height immediately
    document.querySelectorAll('.pricing_pane-card_header').forEach(h => {
      h.style.height = '230px';
    });
    // Then recalc after tab shows
    setTimeout(matchHeaderHeights, 50);
  }
});


// ***** Package Link Indicator ***** //
// Updates and moves the underline under the package name in the tabs heading.

window.Webflow ||= [];
Webflow.push(function () {
  function initPricingTabsIndicator() {
    const wrappers = document.querySelectorAll('.pricing_table-wrapper');
    if (!wrappers.length) return;

    const instances = [];

    wrappers.forEach(wrap => {
      const menu = wrap.querySelector('.pricing_table_tab-menu');
      const indicator = wrap.querySelector('.pricing_table-tabs-indicator');
      if (!menu || !indicator) return;

      if (indicator.parentElement !== menu) menu.appendChild(indicator);

      const links = Array.from(menu.querySelectorAll('.pricing_table_tab-link'));
      let cache = [];

      const measure = () => {
        const mRect = menu.getBoundingClientRect();
        cache = links.map(l => {
          const r = l.getBoundingClientRect();
          return { link: l, w: r.width, x: r.left - mRect.left + menu.scrollLeft };
        });
      };

      const move = ({ w, x }) =>
        requestAnimationFrame(() => {
          indicator.style.width = `${w}px`;
          indicator.style.transform = `translateX(${x}px)`;
        });

      const active = () =>
        cache.find(o => o.link.classList.contains('w--current')) || cache[0];

      measure();
      move(active());

      menu.addEventListener(
        'pointerenter',
        e => {
          const l = e.target.closest('.pricing_table_tab-link');
          if (l) move(cache.find(o => o.link === l));
        },
        true
      );

      menu.addEventListener('pointerleave', () => move(active()));

      menu.addEventListener('click', e => {
        if (e.target.closest('.pricing_table_tab-link')) {
          setTimeout(() => move(active()), 0);
        }
      });

      menu.addEventListener(
        'scroll',
        () => {
          const mRect = menu.getBoundingClientRect();
          cache.forEach(o => {
            const r = o.link.getBoundingClientRect();
            o.x = r.left - mRect.left + menu.scrollLeft;
          });
          move(active());
        },
        { passive: true }
      );

      instances.push({ measure, active, move });
    });

    let rid;
    window.addEventListener(
      'resize',
      () => {
        clearTimeout(rid);
        rid = setTimeout(() => {
          instances.forEach(i => {
            i.measure();
            i.move(i.active());
          });
        }, 120);
      },
      { passive: true }
    );
  }

  function changeTabAndMoveIndicator() {
    const tabName = window.location.hash.substr(1);
    const tabEl = document.querySelector('[data-w-tab="' + tabName + '"]');
    if (tabEl) {
      tabEl.click();

      // Let Webflow update w--current, then recalc indicator
      setTimeout(() => {
        document.querySelectorAll('.pricing_table-wrapper').forEach(wrap => {
          const menu = wrap.querySelector('.pricing_table_tab-menu');
          const indicator = menu?.querySelector('.pricing_table-tabs-indicator');
          if (!menu || !indicator) return;

          const links = Array.from(menu.querySelectorAll('.pricing_table_tab-link'));
          const mRect = menu.getBoundingClientRect();
          const cache = links.map(l => {
            const r = l.getBoundingClientRect();
            return { link: l, w: r.width, x: r.left - mRect.left + menu.scrollLeft };
          });

          const active = cache.find(o => o.link.classList.contains('w--current')) || cache[0];
          indicator.style.width = `${active.w}px`;
          indicator.style.transform = `translateX(${active.x}px)`;
        });
      }, 100);
    }
  }

  // Init on load
  initPricingTabsIndicator();

  // Handle hash-based tab switching
  if (window.location.hash) {
    changeTabAndMoveIndicator();
  }

  // Re-run on hash change
  window.addEventListener('hashchange', changeTabAndMoveIndicator);
});
