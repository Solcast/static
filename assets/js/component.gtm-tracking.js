export default function initGTMTracking() {
  const trackedElements = document.querySelectorAll('[data-tracking="gtm-enabled"]');
  if (!trackedElements.length) return;

  trackedElements.forEach((element) => {
    element.addEventListener('click', () => {
      const scopedForm = element.closest('form');
      if (!scopedForm) return;

      // If form is invalid, stop here
      if (!scopedForm.checkValidity()) {
        return; // Let browser show validation errors
      }

      const formWrapper = element.closest('[data-tracking-event-name]');
      const eventName = formWrapper?.getAttribute('data-tracking-event-name')?.trim();
      if (!eventName) return;

      const emailInput = scopedForm.querySelector('input[name="email"]');
      const phoneInput = scopedForm.querySelector('input[name="phone"]');
      const productSelect = scopedForm.querySelector('select[name="product"]');

      const emailAdr = emailInput?.value.trim() || '';
      const phoneNo = phoneInput?.value.trim() || '';
      const productType = productSelect?.value.trim() || '';

      const dataLayerPayload = {
        event: eventName,
        email: emailAdr,
        phone: phoneNo,
        product: productType
      };

      try {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push(dataLayerPayload);
      } catch (error) {
        // Fail silently
      }
    });
  });
}
