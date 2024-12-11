/*--------------------------*/
/* Hight Light Text Script  */
/*--------------------------*/

document.addEventListener('DOMContentLoaded', function() {
    // Select all elements with the class 'script-text-highlight'

    var elements = document.querySelectorAll('.text-rich-text');

  
    // Loop through each element and apply the text replacement
    elements.forEach(function(element) {
        // Use a regular expression to find the ## content ##
        var elementText = element.innerHTML;
        var newText = elementText.replace(/##(.*?)##/g, '<span class="text-highlight">$1</span>');
        
        // Update the element with the new content
        element.innerHTML = newText;
    });
  });
  
/*------------------------------------------------------*/
/* Highlight Text and Side Bar for Dynamic Colour ID    */
/*------------------------------------------------------*/

// Update text color for elements with the ID "dynamicColor-font"
var dynamicColorElements = document.querySelectorAll("#dynamicColor-font");

dynamicColorElements.forEach(function(dynamicColorElement) {
    var color = dynamicColorElement.getAttribute("data-color");
    dynamicColorElement.style.color = color || "inherit";
});

// Update background color for elements with the ID "dynamicColor-bg"
var dynamicBackgroundColorElements = document.querySelectorAll("#dynamicColor-bg");

dynamicBackgroundColorElements.forEach(function(dynamicBackgroundColorElement) {
    var bgColor = dynamicBackgroundColorElement.getAttribute("data-color");
    dynamicBackgroundColorElement.style.backgroundColor = bgColor;
});
