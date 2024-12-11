/* Pricing Table Redirect Script */ 
/* Allows links to select the correct pricing table tab on page load */

$(document).ready(function() {
    var hash = window.location.hash;
    if (hash) {
      $('.w-tab-link').each(function() {
        var target = $(this).attr('href');
        if (hash == target) {
          $(this).triggerHandler('click');
        }
      });
      
      $('html, body').animate({
        scrollTop: $(hash).offset().top
      }, 300);
    }
  });