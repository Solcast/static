/* --- Blog Template Scripts --- */

//Search Box Redirect
$('form').submit(function() {
  setTimeout(function() {
    location.href = '/blog?*=' + $('#search').val();
  }, 10);
});


//Hides Table of Contents if no H2 found
document.addEventListener("DOMContentLoaded", function() {
  setTimeout(function() {
    const tocElement = document.querySelector('.blog_summary-toc');
    const linkWrapper = tocElement.querySelector('.blog_summary-toc_link-wrapper.is-h2');

    if (linkWrapper && linkWrapper.textContent.trim() === "") {
      tocElement.style.display = "none";
    }
  }, 200);
});
