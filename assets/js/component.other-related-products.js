// component.other-related-products.js
export default function initOtherRelatedProductsHeadingMatch() {
  const sections = document.querySelectorAll('.section_component_other-related-products');
  if (!sections.length) return;

  const matchHeadings = (section) => {
    // Grab .orp_card-heading OR fallback to <h3> directly in .orp_text-content
    const headings = section.querySelectorAll(
      '.orp_card-heading, .orp_text-content > h3:not(.orp_card-heading h3)'
    );
    if (!headings.length) return;

    // Reset heights first
    headings.forEach(h => (h.style.height = 'auto'));

    // Find tallest
    let max = 0;
    headings.forEach(h => {
      const hgt = h.offsetHeight;
      if (hgt > max) max = hgt;
    });

    // Apply tallest height
    headings.forEach(h => (h.style.height = `${max}px`));
  };

  const runAll = () => sections.forEach(matchHeadings);

  // Run after load (fonts/images fully loaded)
  window.addEventListener('load', runAll);

  // Re-run on resize (debounced)
  let rid;
  window.addEventListener(
    'resize',
    () => {
      clearTimeout(rid);
      rid = setTimeout(runAll, 100);
    },
    { passive: true }
  );
}