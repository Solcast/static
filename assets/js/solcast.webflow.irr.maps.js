// Function to update the image source with the thumbnail URL from the API response for all images with a locationID attribute
async function updateAllImagesSrc() {
  try {
    // Select all images with the locationID attribute
    const images = document.querySelectorAll('img[locationID]');

    // Iterate through each image and update its src attribute
    for (const image of images) {
      const locationId = image.getAttribute('locationID');
      // Construct the API URL using the provided location ID
      const apiUrlPre = 'https://api.solcast.com.au/media/';
      const apiUrlPost = '?format=json';
      const apiUrl = `${apiUrlPre}${locationId}${apiUrlPost}`;

      // Perform the fetch request to the API
      const response = await fetch(apiUrl);

      // Check if the response is okay
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Parse the JSON from the response
      const data = await response.json();

      // Check if the response contains files
      if (data.files && data.files.length > 0) {
        // Assuming you want the first file's thumbnail URL
        const thumbnailUrl = data.files[0].thumbnail_url;

        // Update the image's src attribute
        image.src = thumbnailUrl;
        console.log(`Image src updated for locationID ${locationId} to: ${thumbnailUrl}`); // Log the new src URL
      } else {
        console.error(`No files found in the API response for locationID ${locationId}`);
      }
    }
  } catch (error) {
    console.error('Failed to fetch data from API:', error);
  }
}

// Call the function to update all images' src attributes
updateAllImagesSrc();
