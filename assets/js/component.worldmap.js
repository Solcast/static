/*------------------------*/
/* Latest World Map Embed */
/*------------------------*/

export default function initLatestWorldMap() {
  const mapEmbedDiv = document.querySelector('.embed-map');
  if (!mapEmbedDiv) return;

  const globalUrl = 'https://api.solcast.com.au/media/global?format=json';

  fetch(globalUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then((data) => {
      if (!data || !data.files || !data.files.length) return;

      let latestDate = new Date(0);
      let videoUrl = '';

      data.files.forEach((file) => {
        const fileDate = new Date(file.id); // Assuming 'id' is a valid date string
        if (fileDate > latestDate) {
          latestDate = fileDate;

          const additionalVideo = file.additional_videos.find(
            (video) => video.dimensions === '1280x720'
          );

          if (additionalVideo) {
            videoUrl = additionalVideo.video_url;
          }
        }
      });

      const dateElement = document.getElementById('mapDate');
      if (dateElement) {
        dateElement.setAttribute(
          'data-date',
          latestDate.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })
        );
      }

      const videoElement = document.querySelector('.hero_video');
      if (videoElement) {
        videoElement.src = videoUrl;
        videoElement.load();
      }
    })
    .catch((err) => {
      console.error('[world map] failed to fetch or process video data:', err);
    });
}
