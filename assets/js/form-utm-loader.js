window.addEventListener('DOMContentLoaded', function() {
  var utmKeys = ['utm_source', 'utm_medium', 'utm_campaign'];

  function getCookieValue(name) {
    var match = document.cookie.match(new RegExp('(^|;\\s*)' + name + '=([^;]*)'));
    return match ? decodeURIComponent(match[2]) : null;
  }

  utmKeys.forEach(function(key) {
    var value = getCookieValue(key);
    if (!value) return;

    var input = document.getElementById(key);
    if (!input) return;

    input.value = value;
  });
});