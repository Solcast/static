// Footer Newsletter Subscription Popup watcher to resize Salesforce Scubscription iFrame.

const targetElement = document.querySelector('.footer_subscribe-popup');

if (targetElement) {
    // Create a new MutationObserver
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                const displayStyle = window.getComputedStyle(targetElement).display;
                if (displayStyle === 'flex') {
                    iFrameResize({log:true}); //Defined in iframe.resizer.js file, script created by Salesforce 
                }
            }
        });
    });

    // Observer configuration: watch for attribute changes
    const config = { attributes: true };

    // Start observing the target element
    observer.observe(targetElement, config);
}
