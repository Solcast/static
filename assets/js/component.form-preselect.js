export default function initFormPreselects() {
  // ****** Product Preselect ****** //
  const productSelect = document.querySelector('select[data-preselect]');
  if (productSelect) {
    const preselectValue = productSelect.getAttribute('data-preselect');
    if (preselectValue) {
      const matchingOption = Array.from(productSelect.options).find(
        opt => opt.value === preselectValue
      );
      if (matchingOption) {
        productSelect.value = preselectValue;
      }
    }
  }

  // ****** Preselects USA in Forms ****** //
  const forms = document.querySelectorAll('form');
  if (forms.length) {
    forms.forEach(form => {
      const selects = form.querySelectorAll('select[id*="country" i]');
      selects.forEach(select => {
        const usaOption = Array.from(select.options).find(
          opt => opt.text.trim().toLowerCase() === 'united states of america'
        );

        if (usaOption) {
          select.value = usaOption.value;
          select.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });
    });
  }
}
