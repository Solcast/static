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

  const announcementBar = document.querySelector('.announcement_container');
  const navBar          = document.querySelector('.nav_container');

  const EXCLUDED_MENUS = new Set(['about']);

  const isTrackableAnchor = (a) => {
    if (!a) return false;
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
      hamburger.click();
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

  const getHeight = (el) => (el ? Math.round(el.getBoundingClientRect().height) : 0);

  let rafId = null;
  const scheduleUpdateNavPadding = () => {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(updateNavPadding);
  };

  function updateNavPadding() {
    const total = isMobile()
      ? getHeight(announcementBar) + getHeight(navBar) + 16
      : 0;

    if (navMenu) {
      navMenu.style.paddingTop = total ? `${total}px` : '';
    }

    dropdowns.forEach(dd => {
      dd.style.paddingTop = total ? `${total}px` : '';
    });
  }

  const observeOpts = { attributes: true, childList: true, subtree: true };
  const observer = new MutationObserver(scheduleUpdateNavPadding);
  if (announcementBar) observer.observe(announcementBar, observeOpts);
  if (navBar)          observer.observe(navBar, observeOpts);

  window.addEventListener('load', updateNavPadding);

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
    navMenu.addEventListener('focusin', (e) => {
      const wrap = e.target.closest('.nav_top-link-wrap[data-menu]');
      if (!wrap) return;
      const key = wrap.dataset.menu;
      if (EXCLUDED_MENUS.has(key)) {
        closeAllMenus();
      }
    });
  }

  links.forEach(link => {
    const key = link.dataset.menu;

    if (EXCLUDED_MENUS.has(key)) {
      link.addEventListener('click', () => {
        if (isMobile()) {
          handleClose();
        }
      });
      return;
    }

    const dropdown = document.querySelector(`.nav_megamenu_dropdown[data-menu="${key}"]`);
    if (!dropdown) return;

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

  closeButtons.forEach(btn => {
    btn.addEventListener('click', handleClose);
  });

  dropdowns.forEach(dropdown => {
    dropdown.addEventListener('click', (e) => {
      const anchor = e.target.closest('a');
      if (isTrackableAnchor(anchor)) {
        return;
      }
      e.stopPropagation();
    });
  });

  if (navMenu) {
    navMenu.addEventListener('click', (e) => {
      const a = e.target.closest('a');
      if (!a) return;
      const wrap = a.closest('.nav_top-link-wrap[data-menu]');
      if (wrap) {
        const key = wrap.dataset.menu;
        if (!EXCLUDED_MENUS.has(key)) {
          return;
        }
        return;
      }
      if (isTrackableAnchor(a)) {
        return;
      }
      e.stopPropagation();
    }, true);
  }

  window.addEventListener('keydown', e => {
    if (e.key === 'Escape') handleClose();
  });

  window.addEventListener('resize', () => {
    const currentIsMobile = isMobile();
    if (currentIsMobile !== previousIsMobile) {
      handleClose();
      previousIsMobile = currentIsMobile;
    }
    scheduleUpdateNavPadding();
  });

  if (hamburger) {
    hamburger.addEventListener('click', () => {
      if (hamburger.classList.contains('w--open')) {
        closeAllMenus();
      }
      scheduleUpdateNavPadding();
    });
  }

  updateNavPadding();
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
      }
    });
  }
});
