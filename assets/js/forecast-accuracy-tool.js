/* global mapboxgl */
const accuracyApiUrl = 'https://web.solcast.com.au/api/accuracy';
const accuracyVariant = 'forecast';
const accuracyToolContainer = document.getElementById('accuracyTool');
const accuracyFilterForm = document.getElementById('accuracyFilter');
const summaryContainer = document.getElementById('accuracySummary');
const resultsContainer = document.getElementById('accuracyStatistics');
const legendContainer = document.getElementById('accuracyMapLegend');
const accuracyRequestDataUrl = accuracyToolContainer.getAttribute('accuracy-data-url');
let selectedZone = 'All';
let selectedRegion = 'Global';
let displayUnits = '';

mapboxgl.accessToken = 'pk.eyJ1Ijoic29sY2FzdCIsImEiOiJjbHBrbmZybjUwMXhuMm5wZHZkYTl2cHgzIn0.JoR-him1ia9CPTHOTTNIXw';
const map = new mapboxgl.Map({
  container: 'accuracyMap',
  maxZoom: 5,
  minZoom: 1,
  zoom: 1,
  center: [0, 0],
  style: 'mapbox://styles/solcast/clyzom3fx00ee01r5fw927na8',
  attributionControl: false,
});

const legendItems = [
  { label: 'Tropical', color: '#f26e54' },
  { label: 'Desert', color: '#fcb82a' },
  { label: 'Steppe (Grassland & Savannah)', color: '#838bc2' },
  { label: 'Temperate', color: '#98d09d' },
  { label: 'Cold', color: '#60a9d1' },
  { label: 'Polar', color: '#136aae' },
];

function renderMapLegend() {
  legendContainer.innerHTML = legendItems.map((item) => `
    <div class="map-legend-item">
      <div class="map-legend-color" style="background-color: ${item.color};"></div>
      <div class="map-legend-label">${item.label}</div>
    </div>
  `).join('');
}

function handleRelativeTo() {
  const selectedMetric = document.getElementById('metric').value;
  const relativeTo = document.getElementById('relativeto');
  const relativeToDiv = relativeTo.parentElement;
  if (!selectedMetric.includes('%')) {
    relativeToDiv.style.display = 'none';
    relativeTo.value = relativeTo.options[0].value;
  } else {
    relativeToDiv.style.display = 'block';
    relativeTo.hidden = false;
  }
}

function leadTimeContent(lead) {
  return lead.standardDeviation ? `${lead.mean}<br>&#177;${lead.standardDeviation}` : `${lead.mean}`;
}

function addUnits(template) {
  if (displayUnits) {
    template.querySelectorAll('.units').forEach((unitNode) => {
      unitNode.innerHTML = `(${displayUnits})`;
    });
  }
}

function setUnits(parameter, metric) {
  if (metric.includes('%')) return '%';
  if (metric === 'corr') return '';
  switch (parameter) {
    case 'ghi':
    case 'dni':
    case 'gti_fixed':
    case 'gti_tracking':
      return 'W/m<sup>2</sup>';
    case 'pv_power_fixed_10MW':
    case 'pv_power_tracking_10MW':
      return 'MW';
    default:
      return '';
  }
}

function elementFromHtml(html) {
  const template = document.createElement('template');
  template.innerHTML = html.trim();
  return template.content;
}

function loadMapGeoJson(data) {
  const source = map.getSource('sites');
  if (!source) {
    map.addSource('sites', { type: 'geojson', data });
  } else {
    source.setData(data);
  }

  if (!map.getLayer('sites')) {
    map.addLayer({
      id: 'sites',
      type: 'circle',
      source: 'sites',
      paint: {
        'circle-radius': 6,
        'circle-color': '#ffffff',
        'circle-stroke-color': '#000000',
        'circle-stroke-width': 1,
      },
    });
  }

  if (data.features.length === 0) {
    map.fitBounds([[-180, -75], [180, 75]]);
    return;
  }

  const bounds = new mapboxgl.LngLatBounds();
  data.features.forEach((feature) => bounds.extend(feature.geometry.coordinates));
  map.fitBounds(bounds, { padding: 150 });

  const climateZone = document.getElementById('climateZone').value;
  const climateZoneIds = {
    Polar: [6],
    Cold: [5],
    Temperate: [4],
    Tropical: [1],
    Desert: [2],
    Steppe: [3],
  }[climateZone] || null;

  map.setFilter('kg-climate-zones', climateZoneIds ? ['match', ['get', 'zone'], climateZoneIds, true, false] : null);
}

function appendOptions(selectElement, options) {
  options.filter((option) => option && option !== 'Uncategorised').forEach((option) => {
    const optionElement = document.createElement('option');
    optionElement.value = option.value;
    optionElement.text = option.label;
    selectElement.appendChild(optionElement);
  });
}

async function setFilterFormOptions() {
  try {
    const response = await fetch(`${accuracyApiUrl}/${accuracyVariant}/options`);
    const data = await response.json();
    appendOptions(document.getElementById('climateZone'), data.find((option) => option.field === 'climateZone').options);
    appendOptions(document.getElementById('region'), data.find((option) => option.field === 'region').options);
    if (accuracyVariant === 'forecast') {
      appendOptions(document.getElementById('parameter'), data.find((option) => option.field === 'parameter').options);
      appendOptions(document.getElementById('metric'), data.find((option) => option.field === 'metric').options);
      appendOptions(document.getElementById('period'), data.find((option) => option.field === 'period').options);
      appendOptions(document.getElementById('daylightonly'), data.find((option) => option.field === 'daylightonly').options);
      appendOptions(document.getElementById('relativeto'), data.find((option) => option.field === 'relativeto').options);
    }
    handleRelativeTo();
    displayUnits = setUnits(document.getElementById('parameter').value, document.getElementById('metric').value);
  } catch (error) {
    console.error('Error setting filter form options:', error);
  }
}

async function fetchStatsAll(query) {
  try {
    const response = await fetch(`${accuracyApiUrl}/${accuracyVariant}?${query}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching stats:', error);
    throw error;
  }
}

function createSiteRows(sources) {
  const clone = elementFromHtml('<tr></tr><tr></tr><tr></tr><tr></tr>');
  const template2 = document.getElementById('sourceStats');
  const rownodes = clone.querySelectorAll('tr');
  sources.forEach((source, index) => {
    const clone2 = template2.content.cloneNode(true);
    clone2.querySelector('.source').textContent = source.name;

    [0, 1, 2, 24].forEach((leadTime) => {
      const leadTimeItem = source.statistics.find((stat) => stat.leadTime === leadTime);
      if (leadTimeItem) {
        clone2.querySelector(`.col${leadTime}`).innerHTML = leadTimeContent(leadTimeItem);
      }
    });

    rownodes[index].setAttribute('data-source', source.name);
    rownodes[index].appendChild(clone2);
  });
  return clone;
}

function renderStatsSummary(data) {
  summaryContainer.innerHTML = '';
  const template = document.getElementById('summaryStatTable');
  const clone = template.content.cloneNode(true);
  addUnits(clone);
  const summarySubtitle = clone.querySelector('.subTitle');
  const summaryTable = clone.querySelector('table');

  if (data.statistics.length === 0) {
    summarySubtitle.innerHTML = 'No sites meet your criteria, please try again.';
    map.setFilter('kg-climate-zones', null);
    summaryTable.remove();
    summaryContainer.appendChild(clone);
    return;
  }

  if (data.statistics.length < 6) {
    summarySubtitle.innerHTML = `${data.statistics.length} site${data.statistics.length > 1 ? 's' : ''} meet${data.statistics.length === 1 ? 's' : ''} your criteria, see individual site results below. Not enough sites for a meaningful statistical summary.`;
    summaryTable.remove();
    summaryContainer.appendChild(clone);
    return;
  }

  summarySubtitle.innerText = `Based on ${data.statistics.length} sites that meet the criteria of ${selectedRegion} region, ${selectedZone} climate zone${selectedZone === 'All' ? 's' : ''}`;
  if (data.summary) {
    const body = clone.querySelector('tbody');
    const cloned = createSiteRows(data.summary);
    body.appendChild(cloned);
    summaryContainer.appendChild(clone);
  }
}

function createSiteRowsForDetail(site) {
  const clone = elementFromHtml(`
    <tr>
      <td class="name" rowspan="3">${site.name}</td>
      <td class="zone" rowspan="3">${site.climateZone}</td>
    </tr>
    <tr></tr>
    <tr></tr>
  `);
  const template2 = document.getElementById('sourceStats');
  const rownodes = clone.querySelectorAll('tr');
  site.sources.forEach((source, index) => {
    const clone2 = template2.content.cloneNode(true);
    clone2.querySelector('.source').textContent = source.name;

    [0, 1, 2, 24].forEach((leadTime) => {
      const leadTimeItem = source.statistics.find((stat) => stat.leadTime === leadTime);
      if (leadTimeItem) {
        clone2.querySelector(`.col${leadTime}`).innerHTML = leadTimeContent(leadTimeItem);
      }
    });

    rownodes[index].setAttribute('data-source', source.name);
    rownodes[index].appendChild(clone2);
  });
  return clone;
}

function getPopupContent(site) {
  const template = document.getElementById('mapStatTable');
  const clone = template.content.cloneNode(true);
  clone.querySelector('.name').textContent = site.name;
  clone.querySelector('.zone').textContent = `KGPV Zone: ${site.climateZone}`;
  addUnits(clone);
  const body = clone.querySelector('tbody');
  const cloned = createSiteRows(site.sources);
  body.appendChild(cloned);
  // const link = document.createElement('div');
  // link.innerHTML = `<a href="${accuracyRequestDataUrl}" target="_blank">Request raw validation data</a>`;
  // clone.appendChild(link);
  return clone;
}

function createResultsTableElement(data) {
  data.sort((a, b) => a.name.localeCompare(b.name));
  const template = document.getElementById('detailStatTable');
  const clone = template.content.cloneNode(true);
  addUnits(clone);
  const body = clone.querySelector('tbody');
  data.forEach((site) => {
    const cloned = createSiteRowsForDetail(site);
    body.appendChild(cloned);
  });
  return clone;
}

function renderStatsDetail(data) {
  resultsContainer.innerHTML = '';
  if (data.length === 0) return;

  const groupedByRegion = data.reduce((regions, item) => {
    const result = { ...regions };
    if (!result[item.region]) result[item.region] = [];
    result[item.region].push(item);
    return result;
  }, {});

  Object.entries(groupedByRegion).sort((a, b) => a[0].localeCompare(b[0])).forEach(([region, items]) => {
    if (region) {
      const regionHeader = document.createElement('h4');
      regionHeader.innerHTML = region;
      resultsContainer.appendChild(regionHeader);
      const dataTable = createResultsTableElement(items);
      resultsContainer.appendChild(dataTable);
    }
  });
}

async function initAccuracyData(first) {
  const climateZone = document.getElementById('climateZone').value;
  const region = document.getElementById('region').value;
  selectedZone = climateZone || 'All';
  selectedRegion = region || 'Global';
  let query = `climateZone=${climateZone}&region=${region}`;
  if (accuracyVariant === 'forecast') {
    const parameter = document.getElementById('parameter').value;
    const metric = document.getElementById('metric').value;
    const period = document.getElementById('period').value;
    const daylightonly = document.getElementById('daylightonly').value;
    const relativeto = document.getElementById('relativeto').value;
    query += `&parameter=${parameter}&metric=${metric}&period=${period}&daylightonly=${daylightonly}&relativeto=${relativeto}`;
  }

  try {
    const data = await fetchStatsAll(query);
    if (first) setFilterFormOptions();
    renderStatsSummary(data);
    renderStatsDetail(data.statistics);
    loadMapGeoJson(data.geojson);
  } catch (error) {
    console.error('Error initializing accuracy data:', error);
  }
}

map.on('load', () => {
  if (accuracyVariant === undefined) {
    summaryContainer.innerHTML = 'Error: accuracyVariant is not defined.';
    return;
  }
  initAccuracyData(true);
  accuracyFilterForm.addEventListener('input', (event) => {
    event.preventDefault();
    const popup = document.querySelector('.mapboxgl-popup');
    if (popup) popup.remove();
    handleRelativeTo();
    displayUnits = setUnits(document.getElementById('parameter').value, document.getElementById('metric').value);
    initAccuracyData();
  });
  renderMapLegend();
  map.on('click', 'sites', (e) => {
    const coordinates = e.features[0].geometry.coordinates.slice();
    const properties = e.features[0].properties;
    properties.sources = JSON.parse(properties.sources);
    const description = getPopupContent(properties);
    new mapboxgl.Popup({ closeButton: true })
      .setLngLat(coordinates)
      .setDOMContent(description)
      .setMaxWidth('400px')
      .addTo(map);
  });
  map.on('mouseenter', 'sites', () => {
    map.getCanvas().style.cursor = 'pointer';
  });
  map.on('mouseleave', 'sites', () => {
    map.getCanvas().style.cursor = '';
  });
});
