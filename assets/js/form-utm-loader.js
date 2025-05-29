window.addEventListener('DOMContentLoaded', function() {
// the keys you stored in localStorage
var utmKeys = ['utm_source', 'utm_medium', 'utm_campaign'];

utmKeys.forEach(function(key) {
    // get the stored value
    var value = localStorage.getItem(key);
    if (!value) return; // nothing stored, skip

    // find the input with the same ID
    var input = document.getElementById(key);
    if (!input) return; // no such field, skip

    // set its value
    input.value = value;
});
});