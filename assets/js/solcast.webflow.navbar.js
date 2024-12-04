document.addEventListener("scroll", () => {
  const scrollPosition = window.scrollY; // Get current scroll position
  const threshold = 16 * parseFloat(getComputedStyle(document.documentElement).fontSize); // Convert 4 rem to pixels
  
  const div = document.querySelector(".nav_component");
  
  if (scrollPosition >= threshold) {
    div.classList.add("scrolled"); // Add the class to change background color
  } else {
    div.classList.remove("scrolled"); // Remove the class when scrolled back
  }
});
