// Adds punctuation in Change To Column where required.
document.addEventListener('DOMContentLoaded', () => {
  // Select all changeto-container divs
  const changeToContainers = document.querySelectorAll('.changeto-container');

  changeToContainers.forEach((container) => {
    // Select all paragraph elements within the container
    const paragraphs = container.querySelectorAll('p');

    paragraphs.forEach((paragraph, index) => {
      // Check if the current paragraph does not have the class 'w-condition-invisible'
      if (!paragraph.classList.contains('w-condition-invisible')) {
        // Check if the next element is a paragraph and does not have the class 'w-condition-invisible'
        const nextElement = paragraph.nextElementSibling;
        if (nextElement && nextElement.tagName.toLowerCase() === 'p' && !nextElement.classList.contains('w-condition-invisible')) {
          // Create the new span element
          const newSpan = document.createElement('span');
          newSpan.style.marginRight = '3px';
          newSpan.textContent = ',';

          // Append the new span to the current paragraph
          paragraph.appendChild(newSpan);
        }
      }
    });
    