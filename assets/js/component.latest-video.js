// component.embed-map.js
// Latest World Map Embed (loader-ready)

export default function initEmbedMap() {
  const containers = document.querySelectorAll('.embed-map');
  if (!containers.length) return;

  const API_URL = 'https://api.solcast.com.au/media/global?format=json';

  const pickLatest720 = (files) => {
    if (!Array.isArray(files) || !files.length) return { url: '', date: null };

    let latestDate = null;
    let latestUrl = '';

    for (const f of files) {
      // file.id expected in YYYY-MM-DD format (treat invalid as skip)
      const d = new Date(f?.id || '');
      if (isNaN(d)) continue;

      const vids = Array.isArray(f?.additional_videos) ? f.additional_videos : [];
      const v720 = vids.find(v => v?.dimensions === '1280x720' && v?.video_url);

      if (v720 && (!latestDate || d > latestDate)) {
        latestDate = d;
        latestUrl = v720.video_url;
      }
    }

    return { url: latestUrl, date: latestDate };
  };

  (async () => {
    try {
      const res = await fetch(API_URL, { cache: 'no-store' });
      if (!res.ok) return;

      const data = await res.json();
      const { url: videoUrl, date: latestDate } = pickLatest720(data?.files);

      if (!videoUrl || !latestDate) return;

      // Update every .embed-map instance on the page
      containers.forEach(container => {
        // Prefer scoped elements, fall back to global if needed
        const dateEl =
          container.querySelector('#mapDate') ||
          document.getElementById('mapDate');

        if (dateEl) {
          dateEl.setAttribute(
            'data-date',
            latestDate.toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })
          );
        }

        const videoEl =
          container.querySelector('.hero_video') ||
          document.querySelector('.hero_video');

        if (videoEl) {
          if (videoEl.src !== videoUrl) {
            videoEl.src = videoUrl;
            // Ensure reload for some browsers when replacing src
            if (typeof videoEl.load === 'function') videoEl.load();
          }
        }
      });
    } catch {
      // Fail silently (loader pattern)
    }
  })();
}
