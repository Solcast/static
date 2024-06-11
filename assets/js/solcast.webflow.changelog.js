// Adds punctuation in Change To Column where required.
document.addEventListener('DOMContentLoaded', () => {
  const changeAttributeContainers = document.querySelectorAll('.changeattribute-container');

  changeAttributeContainers.forEach((container) => {
    const changeAttributes = container.querySelectorAll('.changeattribute');

    if (changeAttributes.length > 1) {
      changeAttributes.forEach((attr, index) => {
        if (index < changeAttributes.length - 1) {
          const nextAttr = changeAttributes[index + 1];
          if (!nextAttr.classList.contains('w-condition-invisible')) {
            const span = document.createElement('span');
            span.style.marginRight = '3px';
            span.innerHTML = ',';
            attr.insertAdjacentElement('afterend', span);
          }
        }
      });
    }
  });
});
