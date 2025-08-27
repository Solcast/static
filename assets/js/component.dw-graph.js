/**
 * initEmbedGraphs
 *
 * Handles embedding Datawrapper charts with strict validation:
 * - Shows a fallback image first
 * - Reveals the iframe only if it validates (via postMessage height event)
 * - If iframe fails (wrong key/src, timeout, or error), fallback image remains visible
 * - Supports multiple instances of the same chart key on one page
 * - Never auto-repairs mismatched ID/src; strict fail instead
 */
export default function initEmbedGraphs() {
  const ORIGIN = 'https://datawrapper.dwcdn.net';
  const TIMEOUT_MS = 12000;

  // Shared registry of pending charts:
  // key -> [{ timeoutId, reveal, fail, iframe, fallbackImg }]
  window.__dwPendingCharts ||= new Map();
  const pending = window.__dwPendingCharts;

  /**
   * Extract the chart key from a Datawrapper src URL.
   * Example: https://datawrapper.dwcdn.net/edCsT/8/ → "edCsT"
   */
  const extractKeyFromSrc = (src) => {
    const m = /\/\/datawrapper\.dwcdn\.net\/([A-Za-z0-9]+)\//.exec(src || '');
    return m ? m[1] : '';
  };

  /**
   * Generate unique DOM IDs if the same chart is embedded multiple times.
   */
  const uniqueDomId = (() => {
    const seen = new Map();
    return (desired) => {
      if (!desired) return '';
      if (!document.getElementById(desired)) {
        seen.set(desired, 1);
        return desired;
      }
      const base = desired;
      let n = seen.get(base) || 1, candidate;
      do { candidate = `${base}--${++n}`; } while (document.getElementById(candidate));
      seen.set(base, n);
      return candidate;
    };
  })();

  /**
   * One global listener for Datawrapper height messages.
   * When a chart validates, this updates its height and reveals it.
   */
  if (!window.__dwListenerAttached) {
    window.addEventListener('message', (event) => {
      if (event.origin !== ORIGIN) return;
      const payload = event.data?.['datawrapper-height'];
      if (!payload || typeof payload !== 'object') return;

      Object.entries(payload).forEach(([chartKey, height]) => {
        // Update all iframes for this chart key
        const targets = document.querySelectorAll(`iframe[data-dw-key="${chartKey}"]`);
        for (const iframe of targets) {
          iframe.style.height = `${height}px`;
          iframe.dataset.dwHeight = String(height);
          iframe.dataset.dwValid = 'true';
          iframe.style.setProperty('--dw-height', `${height}px`);

          // Dispatch a custom event for external listeners
          const evt = new CustomEvent('datawrapper:height', { detail: { chartKey, height, iframe }, bubbles: true });
          iframe.dispatchEvent(evt);
          document.dispatchEvent(evt);
        }

        // Reveal and clear all pending for this chart key
        const bucket = pending.get(chartKey);
        if (bucket && bucket.length) {
          for (const { timeoutId, reveal } of bucket) {
            clearTimeout(timeoutId);
            reveal();
          }
          pending.delete(chartKey);
        }
      });
    }, false);
    window.__dwListenerAttached = true;
  }

  // Find all Datawrapper embed wrappers
  const graphEmbeds = document.querySelectorAll('.embed-graph');
  if (!graphEmbeds.length) return;

  // Process each embed wrapper
  for (const embed of graphEmbeds) {
    const graphTitle  = embed.getAttribute('data-graph-title')  || '';
    const graphIdAttr = embed.getAttribute('data-graph-id')     || '';
    const graphSrcAtt = embed.getAttribute('data-graph-src')    || '';
    const graphLabel  = embed.getAttribute('data-graph-label')  || '';

    const iframe = embed.querySelector('iframe');
    if (!iframe) continue;

    // Optional fallback image element
    const wrap = embed.closest('.component_datawrapper') || embed;
    const fallbackImg =
      wrap.querySelector('.datawrapper_image') ||
      wrap.querySelector('img');

    // Ensure fallback image is visible initially
    if (fallbackImg) fallbackImg.style.removeProperty('display');

    // Assign a unique DOM id to the iframe
    const desiredId = graphIdAttr || iframe.id || '';
    const finalId = uniqueDomId(desiredId);
    if (finalId) iframe.id = finalId;

    // Populate iframe attributes
    iframe.title = graphTitle;
    iframe.setAttribute('aria-label', graphLabel);
    if (graphSrcAtt && iframe.src !== graphSrcAtt) iframe.src = graphSrcAtt;

    // Determine chart keys (strict check)
    const keyFromId  = (graphIdAttr || iframe.id || '').replace(/^datawrapper-chart-/, '');
    const keyFromSrc = extractKeyFromSrc(iframe.src);
    const baseKey    = keyFromId || keyFromSrc;

    // Fail immediately if no key can be determined
    if (!baseKey) {
      iframe.style.display = 'none';
      if (fallbackImg) fallbackImg.style.display = 'block';
      continue;
    }

    // Strict mismatch: if both id and src keys exist and don't match, fail
    if (keyFromId && keyFromSrc && keyFromId !== keyFromSrc) {
      iframe.dataset.dwValid = 'false';
      iframe.style.display = 'none';
      if (fallbackImg) fallbackImg.style.display = 'block';
      continue;
    }

    // Store canonical chart key
    iframe.dataset.dwKey = baseKey;

    // Keep iframe in layout but visually hidden until validated
    iframe.style.width = '100%';
    if (!iframe.style.height || iframe.style.height === '0px') iframe.style.height = '10px';
    iframe.style.visibility = 'hidden';
    iframe.style.opacity = '0';
    iframe.style.pointerEvents = 'none';
    iframe.dataset.dwValid = 'false';

    /**
     * Reveal iframe: hides fallback image, shows iframe
     */
    const revealIframe = () => {
      iframe.style.visibility = '';
      iframe.style.opacity = '';
      iframe.style.pointerEvents = '';
      if (iframe.style.display === 'none') iframe.style.display = 'block';
      if (fallbackImg) fallbackImg.style.display = 'none';
    };

    /**
     * Fallback: hides iframe, keeps fallback image visible
     */
    const failToImage = () => {
      iframe.dataset.dwValid = 'false';
      iframe.style.display = 'none';
      if (fallbackImg) fallbackImg.style.display = 'block';
    };

    // If server already stamped a height, treat as validated now
    const preHeight = parseInt(iframe.dataset.dwHeight || '0', 10);
    if (preHeight > 0) {
      iframe.dataset.dwValid = 'true';
      iframe.style.height = `${preHeight}px`;
      revealIframe();
      continue;
    }

    // Register pending validation for this chart key
    const bucket = pending.get(baseKey) || [];
    const timeoutId = setTimeout(() => {
      // Remove this iframe from bucket if it times out
      const arr = pending.get(baseKey) || [];
      const idx = arr.findIndex((x) => x.iframe === iframe);
      if (idx >= 0) arr.splice(idx, 1);
      if (!arr.length) pending.delete(baseKey);
      failToImage();
    }, TIMEOUT_MS);

    bucket.push({ timeoutId, reveal: revealIframe, fail: failToImage, iframe, fallbackImg });
    pending.set(baseKey, bucket);

    // Handle network errors explicitly
    iframe.addEventListener('error', failToImage);
  }
}
