window.addEventListener('DOMContentLoaded', function () {
  var utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_form', 'utm_content'];

  function getCookieValue(name) {
    var match = document.cookie.match(new RegExp('(^|;\\s*)' + name + '=([^;]*)'));
    return match ? decodeURIComponent(match[2]) : null;
  }

  utmKeys.forEach(function (key) {
    var value = getCookieValue(key);
    if (!value) return;

    var input = document.getElementById(key);
    if (!input) return;

    input.value = value;
  });

  // Check for utm_url input and populate with relative URL only if no UTM keys are present
  var utmUrlInput = document.getElementById('utm_url');
  if (utmUrlInput) {
    // Check if any UTM keys have values in cookies
    var hasUtmValues = utmKeys.some(function (key) {
      return getCookieValue(key) !== null;
    });

    // Only populate utm_url if no UTM keys are present
    if (!hasUtmValues) {
      var relativeUrl = window.location.pathname + window.location.search + window.location.hash;
      // Strip trailing question mark if present
      relativeUrl = relativeUrl.replace(/\?$/, '');
      utmUrlInput.value = relativeUrl;
    }
  }
}); 