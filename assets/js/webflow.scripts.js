/*------------------------------*/
/*           Nav Menu           */
/*------------------------------*/

document.addEventListener('DOMContentLoaded', () => {
  const MOBILE_BREAKPOINT = 991;
  const isMobile = () => window.innerWidth <= MOBILE_BREAKPOINT;

  const navMenu      = document.querySelector('.nav_menu');
  const hamburger    = document.querySelector('.nav_button');
  const links        = document.querySelectorAll('.nav_top-link-wrap[data-menu]');
  const dropdowns    = document.querySelectorAll('.nav_megamenu_dropdown[data-menu]');
  const backButtons  = document.querySelectorAll('.nav_back');
  const closeButtons = document.querySelectorAll('.nav_close');

  // Menus that should NOT behave like dropdowns:
  const EXCLUDED_MENUS = new Set(['about']);

  // Trackable anchors are ONLY within megamenu content or right-side links
  const isTrackableAnchor = (a) => {
    if (!a) return false;
    // Treat anchors inside excluded menu wrappers as normal links (allow bubbling)
    if (a.closest('.nav_top-link-wrap[data-menu]')) {
      const parentKey = a.closest('.nav_top-link-wrap[data-menu]')?.dataset?.menu;
      if (EXCLUDED_MENUS.has(parentKey)) return true;
    }
    return !!(a.closest('.nav_megamenu_container') || a.closest('.nav_links-right'));
  };

  let previousIsMobile = isMobile();

  const closeAllMenus = () => {
    document.documentElement.classList.remove('megamenu-lock');
    links.forEach(link => link.classList.remove('is-active'));
    dropdowns.forEach(dd => dd.classList.remove('is-open', 'is-slide-in', 'is-slide-out'));
  };

  const resetHamburger = () => {
    if (hamburger?.classList.contains('w--open')) {
      hamburger.click(); // simulate toggle to close
    }
  };

  const closeNavMenu = () => {
    navMenu?.classList.remove('is-open');
  };

  const handleClose = () => {
    closeAllMenus();
    closeNavMenu();
    resetHamburger();
  };

  // Force-close on hover/focus of excluded menus (e.g., "About")
  // Using bubbling 'mouseover' so it triggers even when pointer lands on child anchors/icons.
  if (navMenu) {
    navMenu.addEventListener('mouseover', (e) => {
      if (isMobile()) return;
      const wrap = e.target.closest('.nav_top-link-wrap[data-menu]');
      if (!wrap) return;
      const key = wrap.dataset.menu;
      if (EXCLUDED_MENUS.has(key)) {
        closeAllMenus();
      }
    });
    // Keyboard accessibility: close when focus enters an excluded item
    navMenu.addEventListener('focusin', (e) => {
      const wrap = e.target.closest('.nav_top-link-wrap[data-menu]');
      if (!wrap) return;
      const key = wrap.dataset.menu;
      if (EXCLUDED_MENUS.has(key)) {
        closeAllMenus();
      }
    });
  }

  // Top-level link behavior
  links.forEach(link => {
    const key = link.dataset.menu;

    // EXCLUDED menus (e.g., "about") behave like normal links
    if (EXCLUDED_MENUS.has(key)) {
      // Mobile: tapping "About" should close any open menus, then allow navigation
      link.addEventListener('click', () => {
        if (isMobile()) {
          handleClose(); // close overlays/locks
          // do not preventDefault -> proceed to href
        }
      });
      return;
    }

    const dropdown = document.querySelector(`.nav_megamenu_dropdown[data-menu="${key}"]`);
    if (!dropdown) return;

    // Desktop hover open
    link.addEventListener('mouseenter', () => {
      if (!isMobile()) {
        closeAllMenus();
        link.classList.add('is-active');
        dropdown.classList.add('is-open');
      }
    });

    dropdown.addEventListener('mouseleave', () => {
      if (!isMobile()) closeAllMenus();
    });

    // Mobile click: open submenu (and stop bubbling to avoid datalayer)
    link.addEventListener('click', (e) => {
      if (!isMobile()) return;
      e.preventDefault();
      e.stopPropagation();

      closeAllMenus();
      link.classList.add('is-active');
      dropdown.classList.add('is-slide-in');
      document.documentElement.classList.add('megamenu-lock');
    });
  });

  // Back button: slide submenu out
  backButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const submenu = btn.closest('.nav_megamenu_dropdown');
      if (submenu) {
        submenu.classList.remove('is-slide-in');
        submenu.classList.add('is-slide-out');
        setTimeout(() => submenu.classList.remove('is-slide-out'), 300);
      }
    });
  });

  // Close button: close everything
  closeButtons.forEach(btn => {
    btn.addEventListener('click', handleClose);
  });

  // Inside dropdowns: allow megamenu content links to bubble (for datalayer), suppress other clicks
  dropdowns.forEach(dropdown => {
    dropdown.addEventListener('click', (e) => {
      const anchor = e.target.closest('a');
      if (isTrackableAnchor(anchor)) {
        return; // let it bubble
      }
      e.stopPropagation(); // suppress UI/background clicks
    });
  });

  // SAFETY NET (capture)
  if (navMenu) {
    navMenu.addEventListener('click', (e) => {
      const a = e.target.closest('a');
      if (!a) return;

      // If the anchor is inside a top-level menu wrapper...
      const wrap = a.closest('.nav_top-link-wrap[data-menu]');
      if (wrap) {
        const key = wrap.dataset.menu;
        // For real dropdown toggles, allow their handler
        if (!EXCLUDED_MENUS.has(key)) {
          return;
        }
        // For excluded menus (e.g., "about"), treat as a normal link; do nothing (allow bubbling/default)
        return;
      }

      // Allow trackable anchors (megamenu content + right side) to bubble to datalayer
      if (isTrackableAnchor(a)) {
        return;
      }

      // Everything else in the nav is UI; suppress bubbling
      e.stopPropagation();
    }, true); // capture
  }

  // Escape key: close everything
  window.addEventListener('keydown', e => {
    if (e.key === 'Escape') handleClose();
  });

  // Resize handling
  window.addEventListener('resize', () => {
    const currentIsMobile = isMobile();
    if (currentIsMobile !== previousIsMobile) {
      handleClose(); // Reset menus when crossing breakpoint
      previousIsMobile = currentIsMobile;
    }
  });

  // When hamburger is clicked while open, close submenus
  if (hamburger) {
    hamburger.addEventListener('click', () => {
      if (hamburger.classList.contains('w--open')) {
        closeAllMenus();
      }
    });
  }
});


/*------------------------------*/
/* StatusPal.io required script */
/*------------------------------*/

window.statuspalWidget = {
  subdomain: 'solcast-com',
  badge: {
    enabled: true,
    selector: '.sp-status',
    position: 'bottom',
  },
  banner: {
    enabled: true,
    position: 'bottom-left',
    translations: {
      en: {
        lates_updates: 'View latest updates',
        ongoing: 'Ongoing for {{time_diff}}',
      },
    },
  },
  // serviceId: 1,
};

/*----------------------------------------------*/
/*       Footer Newsletter Submit               */
/*----------------------------------------------*/

document.addEventListener('DOMContentLoaded', () => {
  const subscribeButton = document.getElementById('footer_subscribe-submit');

  if (subscribeButton) {
    subscribeButton.addEventListener('click', () => {
      const emailInput = document.querySelector('#footer_subscribe-email');

      if (emailInput && emailInput.value) {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: 'subscribe_submit',
          email: emailInput.value
        });

        console.log('[Subscribe] DataLayer event pushed:', emailInput.value);
      } else {
        console.warn('[Subscribe] Email input not found or empty');
      }
    });
  }
});
