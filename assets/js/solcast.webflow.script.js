// Splide Scripts

document.addEventListener('DOMContentLoaded', Splide () {
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