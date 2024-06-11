// Function to update the image source with the thumbnail URL from the API response
function updateImageSrc() {
  // Get all image elements with the class 'solarirr-locations_image'
  const images = document.querySelectorAll('.solarirr-locations_image');

  // Loop through each image element
  images.forEach((img) => {
    // Get the location ID from the data-locationid attribute
    const locationId = img.getAttribute('data-locationid');

    // Construct the API URL using the provided location ID
    const apiUrlPre = 'https://api.solcast.com.au/media/';
    const apiUrlPost = '?format=json';
    const apiUrl = `${apiUrlPre}${locationId}${apiUrlPost}`;

    // Perform the fetch request to the API
    fetch(apiUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.statusText}`);
        }
        return response.json(); // Parse the JSON from the response
      })
      .then((data) => {
        if (data.files && data.files.length > 0) {
          // Assuming you want the first file's thumbnail URL
          const thumbnailUrl = data.files[0].thumbnail_url;

          // Update the image element's src attribute
          const imageElement = img; // Use a local variable
          imageElement.src = thumbnailUrl;
        }
      })
      .catch(() => {
        // Handle the error silently or use a custom logging function
      });
  });
}

// Call the function to update image sources
updateImageSrc();
