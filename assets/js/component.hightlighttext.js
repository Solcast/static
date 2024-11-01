/*--------------------------*/
/* Hight Light Text Script  */
/*--------------------------*/

document.addEventListener('DOMContentLoaded', function() {
    // Select all elements with the class 'script-text-highlight'
    var elements = document.querySelectorAll('.script-text-highlight');
  
    // Loop through each element and apply the text replacement
    elements.forEach(function(element) {
        // Use a regular expression to find the ## content ##
        var elementText = element.innerHTML;
        var newText = elementText.replace(/##(.*?)##/g, '<span class="highlight">$1</span>');
        
        // Update the element with the new content
        element.innerHTML = newText;
    });
  });
  