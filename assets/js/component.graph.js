export default function initEmbedGraphs() {
  // Find all .embed-graph elements
  const graphEmbeds = document.querySelectorAll('.embed-graph');
  if (!graphEmbeds.length) return; // nothing to do

  graphEmbeds.forEach(embed => {
    // Get the data-* attributes
    const graphTitle  = embed.getAttribute('data-graph-title')  || '';
    const graphId     = embed.getAttribute('data-graph-id')     || '';
    const graphSrc    = embed.getAttribute('data-graph-src')    || '';
    const graphLabel  = embed.getAttribute('data-graph-label')  || '';
    const graphARatio = embed.getAttribute('data-graph-aratio') || ''; // e.g. "16/9" or "4/3"

    // Find the iframe inside
    const iframe = embed.querySelector('iframe');
    if (!iframe) return;

    // Populate iframe attributes
    iframe.title = graphTitle;
    iframe.setAttribute('aria-label', graphLabel);
    iframe.id = graphId;
    iframe.src = graphSrc;

    // Apply aspect ratio if provided
    if (graphARatio) {
      iframe.style.aspectRatio = graphARatio; // works in modern browsers
      iframe.style.width = '100%';
      iframe.style.height = 'auto';
    }
  });
}
