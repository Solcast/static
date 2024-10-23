/* global Splide */

/*---------------*/
/* Splide Script */
/*---------------*/

document.addEventListener('DOMContentLoaded', () => {
  const splideElement = document.querySelector('.splide');

  if (splideElement) {
    new Splide('.splide', {
      type: 'loop',
      drag: 'free',
      gap: '2rem',
      autoWidth: true,
      pauseOnHover: true,
      pauseOnFocus: true,
      autoScroll: {
        speed: 0.8,
      },
      reducedMotion: {
        speed: 0,
        autoplay: 'pause',
      }
    }).mount(window.splide.Extensions);
  }
});

/*------------------------*/
/* Latest World Map Embed */
/*------------------------*/

function fetchLatestVideoUrl() {
  // Get the div element with class mapEmbed
  const mapEmbedDiv = document.querySelector('.embed-map');
  if (!mapEmbedDiv) {
    return;
  }

  // Define the API URL
  const globalUrl = 'https://api.solcast.com.au/media/global?format=json';

  fetch(globalUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then((data) => {
      if (!data || !data.files || !data.files.length) {
        return;
      }

      // Initialize variables to track the latest date and corresponding video URL
      let latestDate = new Date(0); // Epoch date
      let videoUrl = '';

      // Iterate through each file entry to find the latest date
      data.files.forEach((file) => {
        const fileDate = new Date(file.id); // Assuming 'id' holds the date in YYYY-MM-DD format
        if (fileDate > latestDate) {
          latestDate = fileDate;
          // Find the 1280x720 video URL in the additional_videos array
          const additionalVideo = file.additional_videos.find((video) => video.dimensions === '1280x720');
          if (additionalVideo) {
            // Update video URL if this entry has the latest date
            videoUrl = additionalVideo.video_url;
          }
        }
      });

      // Update the date display if the element is present
      const dateElement = document.getElementById('mapDate');
      if (dateElement) {
        dateElement.setAttribute('data-date', latestDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }));
      }

      // Check if there is a video element with class 'hero_video' and update its 'src'
      const videoElement = document.querySelector('.hero_video');
      if (videoElement) {
        videoElement.src = videoUrl;
        videoElement.load();
      }
    });
}

document.addEventListener('DOMContentLoaded', () => {
  // Check if there is a div with the class 'map-embed'
  if (document.querySelector('.embed-map')) {
    fetchLatestVideoUrl();
  }
});

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

/* Function to check if any dropdown link matches the current page */
function updateCurrentLink() {
  const navDropdowns = document.querySelectorAll('.nav_dropdown');

  navDropdowns.forEach((dropdown) => {
    const links = dropdown.querySelectorAll('.nav_dropdown-list .nav_menu_link');
    links.forEach((link) => {
      if (link.href === window.location.href) {
        dropdown.querySelector('.nav_menu_link.is-heading').classList.add('w--current');
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', updateCurrentLink);

/*------------------------------*/
/* Testimonial Slider Settings  */
/*------------------------------*/

$(".slider-main_component").each(function (index) {
  let loopMode = true;
  if ($(this).attr("loop-mode") === "true") {
    loopMode = true;
  }
  let sliderDuration = 300;
  if ($(this).attr("slider-duration") !== undefined) {
    sliderDuration = +$(this).attr("slider-duration");
  }
  const swiper = new Swiper($(this).find(".swiper")[0], {
    speed: sliderDuration,
    loop: loopMode,
    autoHeight: true,
    followFinger: true,
    freeMode: false,
    slideToClickedSlide: false,
    slidesPerView: 2,
    spaceBetween: "4%",
    rewind: false,
    mousewheel: {
      forceToAxis: true
    },
    keyboard: {
      enabled: true,
      onlyInViewport: true,
    },
    breakpoints: {
      // mobile landscape
      480: {
        slidesPerView: 1,
        spaceBetween: "4%"
      },
      // tablet
      768: {
        slidesPerView: 1,
        spaceBetween: "4%"
      },
      // desktop
      992: {
        slidesPerView: 2,
        spaceBetween: "3%"
      }
    },
    navigation: {
      nextEl: $(this).find(".swiper-next")[0],
      prevEl: $(this).find(".swiper-prev")[0],
      disabledClass: "is-disabled"
    },
  });
});

/*--------------------------*/
/* Hight Light Text Script  */
/*--------------------------*/

document.addEventListener('DOMContentLoaded', function() {
  // Select all elements with the class 'script-text-highlight'
  var elements = document.querySelectorAll('.script-text-highlight');

  // Loop through each element and apply the text replacement
  elements.forEach(function(element) {
      // Use a regular expression to find the ## content ##
      var elementText = element.innerHTML;
      var newText = elementText.replace(/##(.*?)##/g, '<span class="highlight">$1</span>');
      
      // Update the element with the new content
      element.innerHTML = newText;
  });
});

/*------------------------------------------*/
/* Counter Script for Page Banner Component */
/*------------------------------------------*/

// Select all the paragraphs with the class 'stat-card_heading'
const paragraphs = document.querySelectorAll('.stat-card_heading');

// Regular expression to match number sets in each paragraph
const regex = /\d+/g;

// Loop through each element and apply the transformation
paragraphs.forEach(function(paragraph) {
    // Replace each number with the span element
    paragraph.innerHTML = paragraph.innerHTML.replace(regex, function(match) {
        // Format the number with commas using toLocaleString
        const formattedNumber = Number(match).toLocaleString();
        
        return `<span data-purecounter-start="0" data-purecounter-end="${match}" data-purecounter-separator="true" class="purecounter">${formattedNumber}</span>`;
    });
});

new PureCounter();