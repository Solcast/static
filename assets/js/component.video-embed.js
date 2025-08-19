// Select all parent divs with the class 'section-banner-component-video_wrapper'
const videoWrappers = document.querySelectorAll('.section-banner-component-video_wrapper');

videoWrappers.forEach(wrapper => {
  // Get the div inside each wrapper that contains the data-video-src and data-object-fit attributes
  const videoDiv = wrapper.querySelector('[data-video-src]');
  if (!videoDiv) return; // Skip if no videoDiv is found

  // Get the value of the data-video-src attribute
  const videoSrc = videoDiv.getAttribute('data-video-src');

  // Get the value of the data-object-fit attribute
  const objectFit = videoDiv.getAttribute('data-object-fit');

  // Get the video element within that div
  const videoElement = videoDiv.querySelector('video');
  if (!videoElement) return; // Skip if no video element is found

  // Update the src attribute of the video element with the new video source
  videoElement.setAttribute('src', videoSrc);

  // Update the object-fit style property of the video element
  if (objectFit) videoElement.style.objectFit = objectFit;
});
