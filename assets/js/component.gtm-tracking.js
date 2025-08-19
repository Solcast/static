export default function initGTMTracking() {
  console.log('[GTM Tracking] Initializing GTM tracking...');

  const trackedElements = document.querySelectorAll('[data-tracking="gtm-enabled"]');
  console.log(`[GTM Tracking] Found ${trackedElements.length} tracked elements`);

  if (!trackedElements.length) {
    console.warn('[GTM Tracking] No elements with data-tracking="gtm-enabled" found');
    return;
  }

  trackedElements.forEach((element, index) => {
    console.log(`[GTM Tracking] Setting up listener for element ${index + 1}:`, element);

    element.addEventListener('click', (e) => {
      console.log('[GTM Tracking] Click event triggered on:', e.target);

      const scopedForm = element.closest('form');
      if (!scopedForm) {
        console.warn('[GTM Tracking] No parent form found for clicked element');
        return;
      }
      console.log('[GTM Tracking] Found parent form:', scopedForm);

      // If form is invalid, stop here
      if (!scopedForm.checkValidity()) {
        console.warn('[GTM Tracking] Form validation failed, stopping tracking');
        return; // Let browser show validation errors
      }
      console.log('[GTM Tracking] Form validation passed');

      const formWrapper = element.closest('[data-tracking-event-name]');
      const eventName = formWrapper?.getAttribute('data-tracking-event-name')?.trim();

      if (!eventName) {
        console.error('[GTM Tracking] No event name found in data-tracking-event-name attribute');
        return;
      }
      console.log(`[GTM Tracking] Event name: "${eventName}"`);

      const emailInput = scopedForm.querySelector('input[name="email"]');
      const phoneInput = scopedForm.querySelector('input[name="phone"]');
      const productSelect = scopedForm.querySelector('select[name="product"]');

      console.log('[GTM Tracking] Form inputs found:', {
        email: !!emailInput,
        phone: !!phoneInput,
        product: !!productSelect
      });

      const emailAdr = emailInput?.value.trim() || '';
      const phoneNo = phoneInput?.value.trim() || '';
      const productType = productSelect?.value.trim() || '';

      console.log('[GTM Tracking] Extracted values:', {
        email: emailAdr ? '[REDACTED]' : '(empty)',
        phone: phoneNo ? '[REDACTED]' : '(empty)',
        product: productType || '(empty)'
      });

      const dataLayerPayload = {
        event: eventName,
        email: emailAdr,
        phone: phoneNo,
        product: productType
      };

      console.log('[GTM Tracking] DataLayer payload prepared:', {
        ...dataLayerPayload,
        email: dataLayerPayload.email ? '[REDACTED]' : '',
        phone: dataLayerPayload.phone ? '[REDACTED]' : ''
      });

      try {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push(dataLayerPayload);
        console.log('[GTM Tracking] Successfully pushed to dataLayer');
        console.log(`[GTM Tracking] Current dataLayer length: ${window.dataLayer.length}`);
      } catch (error) {
        console.error('[GTM Tracking] Error pushing to dataLayer:', error);
      }
    });
  });

  console.log('[GTM Tracking] Initialization complete');
}
