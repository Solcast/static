/*------------------------------------------*/
/* Counter Script for Stat Grid Component   */
/*------------------------------------------*/

export default function initCounters() {
  const paragraphs = document.querySelectorAll('.stat-card_heading');
  const regex = /\d+/g;

  paragraphs.forEach(function(paragraph) {
    paragraph.innerHTML = paragraph.innerHTML.replace(regex, function(match) {
      const formattedNumber = Number(match).toLocaleString();
      return `<span data-purecounter-start="0" data-purecounter-end="${match}" data-purecounter-separator="true" class="purecounter">${formattedNumber}</span>`;
    });
  });

  new PureCounter();
}