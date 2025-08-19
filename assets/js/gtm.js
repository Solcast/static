/*----------------------------------------------*/
/*            Data Attribute Cleanup            */
/*  Removes empty data-gtm attr. from elements  */
/*----------------------------------------------*/

document.addEventListener('DOMContentLoaded', () => {
    // Select all elements in the document
    document.querySelectorAll('*').forEach(el => {
      // Loop through a copy of attributes so we can safely remove while iterating
      Array.from(el.attributes).forEach(attr => {
        // Check if attribute name starts with "data-gtm" and has no value
        if (attr.name.startsWith('data-gtm') && !attr.value.trim()) {
          el.removeAttribute(attr.name);
        }
      });
    });
  });
  
/*----------------------------------------------*/
/*                  GTM Script                  */
/*----------------------------------------------*/

(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;var n=d.querySelector('[nonce]');
    n&&j.setAttribute('nonce',n.nonce||n.getAttribute('nonce'));f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','GTM-5DN8X5GS');
