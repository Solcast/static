/* Global locationId */

// Define the API URL
const heroElement = document.querySelector('.hero');
const locationId = heroElement ? heroElement.id : null;
const apiUrlPre = 'https://api.solcast.com.au/media/';
const apiUrlPost = '?format=json';
const apiUrl = apiUrlPre + locationId + apiUrlPost;

const getJSON = function getJSON(url, callback) {
  const xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.responseType = 'json';
  xhr.onload = function onLoad() {
    const { status } = xhr;
    if (status === 200) {
      callback(null, xhr.response);
    } else {
      callback(status, xhr.response);
    }
  };
  xhr.send();
};

getJSON(
  apiUrl,
  (err, data) => {
    if (err !== null) {
        return;
    } else {
      const videoElement = document.querySelector('.hero_video');
      if (videoElement) {
        videoElement.src = data.files[0].video_url;
        videoElement.poster = data.files[0].poster_url;
        videoElement.load(); // Load the new video
        document.querySelector('.global_solcast_date').innerHTML = data.files[0].title;
      } else {
        return;
      }
      for (let i = 0; i <= 14; i++) {
        document.getElementById('gallery-list-section')
          .innerHTML += '    <div class="item" data-code="global">'
    + `        <div class="inner_block" data-item-id="${data.files[i].id}" data-item-poster="${data.files[i].poster_url}" data-item-video-url="${data.files[i].video_url}" data-item-date="${data.files[i].title}">`
    + '            <div class="item-wrap">'
    + `                <img integrity="sha256-+Myk+fv6YyfOJhPb6Q1aeY0hj3gbe6DU5SIQmquT/uE=" crossorigin="anonymous" src="${data.files[i].thumbnail_url}" alt="Solar irradiance data for ${data.files[i].location} ${data.files[i].title}" />`
    + `                <div class="label">${data.files[i].title}</div>`
    + '            </div>'
    + '        </div>'
    + '    </div>';
      }

      const urlParams = new URLSearchParams(window.location.search);
      const myParam = urlParams.get('id');
      if (myParam !== '') {
        document.querySelectorAll('#gallery-list-section .item .inner_block').forEach((load_summary) => {
          const getItemId = load_summary.getAttribute('data-item-id');
          if (getItemId == myParam) {
            const getItemDate = load_summary.getAttribute('data-item-date');
            const getItemDataPoster = load_summary.getAttribute('data-item-poster');
            const getItemDataVideoUrl = load_summary.getAttribute('data-item-video-url');
            const videoElement = document.querySelector('.hero_video');
            if (videoElement) {
              videoElement.src = getItemDataVideoUrl;
              videoElement.poster = getItemDataPoster;
              videoElement.load(); // Load the new video
              document.querySelector('.global_solcast_date').innerHTML = getItemDate;
            } else {

            }
          }
        });
      }

      document.querySelectorAll('#gallery-list-section .item .inner_block').forEach((summary) => {
        summary.addEventListener('click', () => {
          const getItemId = summary.getAttribute('data-item-id');
          const getItemDate = summary.getAttribute('data-item-date');
          const getItemDataPoster = summary.getAttribute('data-item-poster');
          const getItemDataVideoUrl = summary.getAttribute('data-item-video-url');
          const videoElement = document.querySelector('.hero_video');
          if (videoElement) {
            videoElement.src = getItemDataVideoUrl;
            videoElement.poster = getItemDataPoster;
            videoElement.load(); // Load the new video
            document.querySelector('.global_solcast_date').innerHTML = getItemDate;
            window.history.replaceState({}, '', `?id=${getItemId}`);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else {

          }
        });
      });
    }
  },
);
