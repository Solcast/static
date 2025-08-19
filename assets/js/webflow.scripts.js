/*------------------------------*/
/* StatusPal.io required script */
/*------------------------------*/

window.statuspalWidget = {
  subdomain: 'solcast-com',
  badge: {
    enabled: true,
    selector: '.sp-status', // Optional
    position: 'bottom', // Optional [top | bottom | left | right] - defaults to top.
  },
  banner: {
    enabled: true,
    position: 'bottom-left', // Optional [bottom-left | bottom-right | top-left | top-right], def: bottom-left
    translations: {
      en: {
        lates_updates: 'View latest updates',
        ongoing: 'Ongoing for {{time_diff}}',
      },
    },
  },
  // serviceId: 1, // Optional - Display the status of only one service
};

/*------------------------------*/
/*         Nav Menu             */
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

  // Top-level link click (mobile): open submenu
  links.forEach(link => {
    const key = link.dataset.menu;
    const dropdown = [...dropdowns].find(dd => dd.dataset.menu === key);
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

  // Prevent submenu clicks from closing nav
  dropdowns.forEach(dropdown => {
    dropdown.addEventListener('click', e => e.stopPropagation());
  });

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

/*----------------------------------------------*/
/*       Footer Newsletter Submit               */
/*----------------------------------------------*/

document.addEventListener('DOMContentLoaded', () => {
  const subscribeButton = document.getElementById('footer_subscribe-submit');

  if (subscribeButton) {
    subscribeButton.addEventListener('click', () => {
      const emailInput = document.querySelector('#footer_subscribe-email'); // Adjust the selector to match your actual input

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
