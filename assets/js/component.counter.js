/*------------------------------------------*/
/* Counter Script for Page Banner Component */
/*------------------------------------------*/

// Select all the paragraphs with the class 'stat-card_heading'
const paragraphs = document.querySelectorAll('.stat-card_heading');

// Regular expression to match number sets in each paragraph
const regex = /\d+/g;

// Loop through each element and apply the transformation
paragraphs.forEach(function(paragraph) {
    // Replace each number with the span element
    paragraph.innerHTML = paragraph.innerHTML.replace(regex, function(match) {
        // Format the number with commas using toLocaleString
        const formattedNumber = Number(match).toLocaleString();
        
        return `<span data-purecounter-start="0" data-purecounter-end="${match}" data-purecounter-separator="true" class="purecounter">${formattedNumber}</span>`;
    });
});

new PureCounter();