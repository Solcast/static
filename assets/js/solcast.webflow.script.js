// Splide Scripts
document.addEventListener('DOMContentLoaded', function () {
    new Splide('.splide', {
      type   : 'loop',
      drag   : 'free',
      focus  : 'center',
      perPage: 9,
      autoWidth: false,
      pauseOnHover: true,
      pauseOnFocus: true,
      autoScroll: {
        speed: 0.8,
      },
      breakpoints: {
          1100: {
            perPage: 6,
        },
        760: {
          perPage: 4,
        },
        580: {
            perPage: 3,
        },
        400: {
          perPage: 2,
        },
        }
        }
    ).mount( window.splide.Extensions );
  });

// Map Embed




// Solar Radiation Maps



//Home Page Video
    // This function formats the date and time in the required format
    function formatDateTimeUTC() {
        const now = new Date(); // Gets the current date and time
        const year = now.getUTCFullYear();
        const month = String(now.getUTCMonth() + 1).padStart(2, '0'); // Adds 1 because months start at 0
        const day = String(now.getUTCDate()).padStart(2, '0');
        const hours = String(now.getUTCHours()).padStart(2, '0');
        const minutes = String(now.getUTCMinutes()).padStart(2, '0');
        // Format: YYYY-MM-DDTHH:MM:00
        return `${year}-${month}-${day}T${hours}:${minutes}:00`;
    }

    // This function updates the video URLs
    function updateVideoUrls() {
        const dateTime = formatDateTimeUTC(); // Get the current formatted UTC date and time
        const baseUrl = "https://media.solcast.com/latest/global/1280x720";
        // Update the poster and src attributes
        const videoElement = document.querySelector('.hero_video');
        videoElement.setAttribute('poster', `${baseUrl}.jpg?time=${dateTime}`);
        videoElement.setAttribute('src', `${baseUrl}.mp4?time=${dateTime}`);
    }

    document.addEventListener('DOMContentLoaded', updateVideoUrls);


//StatusPal
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
            translations: { // Optional - There are 7 supported languages by default (Danish, German, English, Spanish, French, Dutch and Portuguese). You can extend supported languages by this option.
                en: {
                    lates_updates: 'View latest updates',
                    ongoing: 'Ongoing for {{time_diff}}',
                },
            },
        }, 
    // serviceId: 1, // Optional - Display the status of only one service
    }

// Function to check if any dropdown link matches the current page
    function updateCurrentLink() {
        const navDropdowns = document.querySelectorAll('.nav_dropdown');

        navDropdowns.forEach(dropdown => {
            const links = dropdown.querySelectorAll('.nav_dropdown-list .nav_menu_link');
            links.forEach(link => {
                if (link.href === window.location.href) {
                    dropdown.querySelector('.nav_menu_link.is-heading').classList.add('w--current');
                }
            });
        });
    }

    document.addEventListener('DOMContentLoaded', updateCurrentLink);
