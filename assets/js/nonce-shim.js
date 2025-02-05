(function() {
    // Define your nonce value
    var nonceValue = 'e1659894ea52';

    // Get all script tags on the page
    var scripts = document.getElementsByTagName('script');

    // Loop through each script tag
    for (var i = 0; i < scripts.length; i++) {
        // Check if the script tag already has a nonce attribute
        if (!scripts[i].hasAttribute('nonce')) {
            // If not, add the nonce attribute with the specified value
            scripts[i].setAttribute('nonce', nonceValue);

            // Create a new script element
            var newScript = document.createElement('script');
            newScript.src = scripts[i].src;
            newScript.setAttribute('nonce', nonceValue);

            // Replace the old script with the new one
            scripts[i].parentNode.replaceChild(newScript, scripts[i]);
        }
    }
})();