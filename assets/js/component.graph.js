export default function initEmbedGraphs() {
  const ORIGIN = 'https://datawrapper.dwcdn.net';
  const TIMEOUT_MS = 5000;

  const graphEmbeds = document.querySelectorAll('.embed-graph');
  if (!graphEmbeds.length) return;

  // Global pending map so re-inits don't duplicate listeners
  window.__dwPendingCharts ||= new Map(); // chartKey -> { timeoutId, reveal }
  const pending = window.__dwPendingCharts;

  // Listen once for Datawrapper height messages
  const onMessage = (event) => {
    if (event.origin !== ORIGIN) return;
    const dwHeights = event.data?.['datawrapper-height'];
    if (!dwHeights || typeof dwHeights !== 'object') return;

    Object.entries(dwHeights).forEach(([chartKey, height]) => {
      const iframe = document.getElementById(`datawrapper-chart-${chartKey}`);
      if (iframe) {
        iframe.style.height = `${height}px`;
        iframe.dataset.dwHeight = String(height);
        iframe.style.setProperty('--dw-height', `${height}px`);

        const evt = new CustomEvent('datawrapper:height', {
          detail: { chartKey, height, iframe },
          bubbles: true,
        });
        iframe.dispatchEvent(evt);
        document.dispatchEvent(evt);
      }

      const entry = pending.get(chartKey);
      if (entry) {
        clearTimeout(entry.timeoutId);
        entry.reveal();
        pending.delete(chartKey);
      }
    });
  };

  if (!window.__dwListenerAttached) {
    window.addEventListener('message', onMessage, false);
    window.__dwListenerAttached = true;
  }

  graphEmbeds.forEach((embed) => {
    const graphTitle = embed.getAttribute('data-graph-title') || '';
    const graphId    = embed.getAttribute('data-graph-id')    || '';
    const graphSrc   = embed.getAttribute('data-graph-src')   || '';
    const graphLabel = embed.getAttribute('data-graph-label') || '';
    const chartKey   = graphId.replace(/^datawrapper-chart-/, '');

    const iframe = embed.querySelector('iframe');
    if (!iframe) return;

    const wrapper = embed.closest('.component_datawrapper');
    const fallbackImg =
      wrapper?.querySelector('.datawrapper_image') ||
      wrapper?.querySelector('img');

    const failToImage = () => {
      iframe.style.display = 'none';
      embed.style.display = 'none';
      if (fallbackImg) fallbackImg.style.display = 'block';
    };

    const hideVisuallyButLoad = () => {
      embed.style.display = '';
      if (fallbackImg) fallbackImg.style.display = 'block';
      iframe.style.visibility = 'hidden';
      iframe.style.opacity = '0';
      iframe.style.width = '1px';
      iframe.style.height = '1px';
      iframe.style.pointerEvents = 'none';
    };

    const revealIframe = () => {
      iframe.style.visibility = '';
      iframe.style.opacity = '';
      iframe.style.width = '';
      iframe.style.pointerEvents = '';
      iframe.style.display = 'block';
      embed.style.display = '';
      if (fallbackImg) fallbackImg.style.display = 'none';
    };

    // Populate iframe attributes
    iframe.title = graphTitle;
    iframe.setAttribute('aria-label', graphLabel);
    if (graphId) iframe.id = graphId;
    if (graphSrc) iframe.src = graphSrc;
    iframe.style.width = '100%';

    if (!graphSrc || !chartKey) {
      failToImage();
      return;
    }

    hideVisuallyButLoad();

    const timeoutId = setTimeout(() => {
      pending.delete(chartKey);
      failToImage();
    }, TIMEOUT_MS);

    pending.set(chartKey, { timeoutId, reveal: revealIframe });
  });
}
