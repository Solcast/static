/* global mapboxgl */
const accuracyApiUrl = 'https://web.solcast.com.au/api/accuracy';
const accuracyVariant = 'historic';
const accuracyToolContainer = document.getElementById('accuracyTool');
const accuracyFilterForm = document.getElementById('accuracyFilter');
const summaryContainer = document.getElementById('accuracySummary');
const resultsContainer = document.getElementById('accuracyStatistics');
const legendContainer = document.getElementById('accuracyMapLegend');
const accuracyRequestDataUrl = accuracyToolContainer.getAttribute('accuracy-data-url');
let selectedZone = 'All';
let selectedRegion = 'Global';

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

function renderMapLegend() {
  legendContainer.innerHTML = '';
  const legendItems = [
    { label: 'Tropical', color: '#f26e54' },
    { label: 'Desert', color: '#fcb82a' },
    { label: 'Steppe (Grassland &amp; Savannah)', color: '#838bc2' },
    { label: 'Temperate', color: '#98d09d' },
    { label: 'Cold', color: '#60a9d1' },
    { label: 'Polar', color: '#136aae' },
  ];
  legendItems.forEach((item) => {
    const legendItem = document.createElement('div');
    legendItem.className = 'map-legend-item';
    const color = document.createElement('div');
    color.className = 'map-legend-color';
    color.style.backgroundColor = item.color;
    legendItem.appendChild(color);
    const label = document.createElement('div');
    label.className = 'map-legend-label';
    label.innerHTML = item.label;
    legendItem.appendChild(label);
    legendContainer.appendChild(legendItem);
  });
}

function loadMapGeoJson(data) {
  if (!map.getSource('sites')) {
    map.addSource('sites', {
      type: 'geojson',
      data,
    });
  } else {
    map.getSource('sites').setData(data);
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
  map.fitBounds(bounds, {
    padding: 150,
  });

  const climateZone = document.getElementById('climateZone').value;
  let climateZoneIds = null;
  switch (climateZone) {
    case 'Polar':
      climateZoneIds = [6];
      break;
    case 'Cold':
      climateZoneIds = [5];
      break;
    case 'Temperate':
      climateZoneIds = [4];
      break;
    case 'Tropical':
      climateZoneIds = [1];
      break;
    case 'Desert':
      climateZoneIds = [2];
      break;
    case 'Steppe':
      climateZoneIds = [3];
      break;
    default:
      break;
  }

  if (climateZoneIds !== null) {
    map.setFilter('kg-climate-zones', ['match', ['get', 'zone'], climateZoneIds, true, false]);
  } else {
    map.setFilter('kg-climate-zones', null);
  }
}

function appendOptions(selectElement, options) {
  options.forEach((option) => {
    if (option !== '' && option !== 'Uncategorised') {
      const optionElement = document.createElement('option');
      optionElement.value = option.value;
      optionElement.text = option.label;
      selectElement.appendChild(optionElement);
    }
  });
}

function setFilterFormOptions() {
  fetch(`${accuracyApiUrl}/${accuracyVariant}/options`)
    .then((response) => response.json())
    .then((data) => {
      appendOptions(document.getElementById('climateZone'), data.find((option) => option.field === 'climateZone').options);
      appendOptions(document.getElementById('region'), data.find((option) => option.field === 'region').options);
      if (accuracyVariant === 'forecast') {
        appendOptions(document.getElementById('season'), data.find((option) => option.field === 'season').options);
        appendOptions(document.getElementById('param'), data.find((option) => option.field === 'param').options);
        appendOptions(document.getElementById('period'), data.find((option) => option.field === 'period').options);
        appendOptions(document.getElementById('statistic'), data.find((option) => option.field === 'statistic').options);
      }
    });
}

function createSummaryTableElement(data) {
  const table = document.createElement('table');
  // table header
  const head = document.createElement('thead');
  const headerRowLabels = ['', 'Normalised Bias', 'Bias (W/m<sup>2</sup>)', 'nMAD', 'nRMSD'];
  const headRow = document.createElement('tr');
  headerRowLabels.forEach((label) => {
    const labelCell = document.createElement('td');
    labelCell.innerHTML = label;
    headRow.appendChild(labelCell);
  });
  head.appendChild(headRow);
  table.appendChild(head);
  // table body
  const body = document.createElement('tbody');
  let row = document.createElement('tr');
  let cell = document.createElement('td');
  cell.innerHTML = 'Mean error';
  row.appendChild(cell);
  cell = document.createElement('td');
  cell.innerHTML = `${data.normalisedBiasMean}%`;
  row.appendChild(cell);
  cell = document.createElement('td');
  cell.innerHTML = `${data.biasMean}`;
  row.appendChild(cell);
  cell = document.createElement('td');
  cell.innerHTML = `${data.nmadMean}%`;
  row.appendChild(cell);
  cell = document.createElement('td');
  cell.innerHTML = `${data.nrmsdMean}%`;
  row.appendChild(cell);
  body.appendChild(row);
  row = document.createElement('tr');
  cell = document.createElement('td');
  cell.innerHTML = 'Std. Dev.';
  row.appendChild(cell);
  cell = document.createElement('td');
  cell.innerHTML = `${data.normalisedBiasStandardDeviation}%`;
  row.appendChild(cell);
  cell = document.createElement('td');
  cell.innerHTML = `${data.biasStandardDeviation}`;
  row.appendChild(cell);
  cell = document.createElement('td');
  cell.innerHTML = `${data.nmadStandardDeviation}%`;
  row.appendChild(cell);
  cell = document.createElement('td');
  cell.innerHTML = `${data.nrmsdStandardDeviation}%`;
  row.appendChild(cell);
  body.appendChild(row);
  table.appendChild(body);

  return table;
}

function fetchStatsAll(query) {
  return new Promise((resolve, reject) => {
    fetch(`${accuracyApiUrl}/${accuracyVariant}?${query}`)
      .then((response) => {
        resolve(response.json());
      })
      .catch((error) => {
        reject(error);
      });
  });
}

function updateSummaryTableClasses(parentElement) {
  let i = 0;
  // apply table classes used in webflow pages
  const table = parentElement.getElementsByTagName('table');
  for (i = 0; i < table.length; i += 1) {
    table[i].className = 'table table_col-5';
  }
  const headers = parentElement.getElementsByTagName('thead');
  for (i = 0; i < headers.length; i += 1) {
    headers[i].className = 'table_head';
  }
  const body = parentElement.getElementsByTagName('tbody');
  for (i = 0; i < body.length; i += 1) {
    body[i].className = 'table_body';
  }
  const cells = parentElement.getElementsByTagName('td');
  for (i = 0; i < cells.length; i += 1) {
    cells[i].className = 'td table_cell';
  }
  const rows = parentElement.getElementsByTagName('tr');
  for (i = 0; i < rows.length; i += 1) {
    rows[i].className = 'table_row';
  }
}

function renderStatsSummary(data) {
  summaryContainer.innerHTML = '';
  const summaryTitle = document.createElement('h4');
  summaryTitle.innerHTML = 'Solcast error statistics from DNV Bankability Report 2023';
  summaryContainer.appendChild(summaryTitle);
  const summarySubtitle = document.createElement('p');
  summarySubtitle.className = 'text-rich-text';
  if (data.statistics.length === 0) {
    summarySubtitle.innerHTML = 'No sites meet your criteria, please try again.';
    summaryContainer.appendChild(summarySubtitle);
    map.setFilter('kg-climate-zones', null);
    return;
  }
  if (data.statistics.length < 5) {
    summarySubtitle.innerHTML = `${data.statistics.length} site${data.statistics.length > 1 ? 's' : ''} meet${data.statistics.length === 1 ? 's' : ''} your criteria, see individual site results below. Not enough sites for a meaningful statistical summary.`;
    summaryContainer.appendChild(summarySubtitle);
    return;
  }
  summarySubtitle.innerText = `Based on ${data.statistics.length} sites that meet the criteria of ${selectedRegion} region, ${selectedZone} climate zone${selectedZone === 'All' ? 's' : ''}`;
  summaryContainer.appendChild(summarySubtitle);
  const dataTable = createSummaryTableElement(data.summary);
  summaryContainer.appendChild(dataTable);
  updateSummaryTableClasses(summaryContainer);
}

function updateResultsTableClasses(parentElement) {
  let i = 0;
  // apply table classes used in webflow pages
  const table = parentElement.getElementsByTagName('table');
  for (i = 0; i < table.length; i += 1) {
    table[i].className = 'table table_col-6';
  }
  const headers = parentElement.getElementsByTagName('thead');
  for (i = 0; i < headers.length; i += 1) {
    headers[i].className = 'table_head';
  }
  const body = parentElement.getElementsByTagName('tbody');
  for (i = 0; i < body.length; i += 1) {
    body[i].className = 'table_body';
  }
  const cells = parentElement.getElementsByTagName('td');
  for (i = 0; i < cells.length; i += 1) {
    if (cells[i].getAttribute('headers') === 'site') {
      cells[i].className = 'td table_cell cell-align-left';
    } else {
      cells[i].className = 'td table_cell';
    }
  }
  const rows = parentElement.getElementsByTagName('tr');
  for (i = 0; i < rows.length; i += 1) {
    rows[i].className = 'table_row';
  }
}

function createResultsTableElement(data) {
  // sort by name
  data.sort((a, b) => a.name.localeCompare(b.name));

  const table = document.createElement('table');
  // table header
  const head = document.createElement('thead');
  const headerRowLabels = ['Site', 'KGPV Zone', 'Normalised Bias', 'Bias (W/m<sup>2</sup>)', 'nMAD', 'nRMSD'];
  const row = document.createElement('tr');
  headerRowLabels.forEach((label) => {
    const labelCell = document.createElement('td');
    labelCell.innerHTML = label;
    row.appendChild(labelCell);
  });
  head.appendChild(row);
  table.appendChild(head);
  // table body
  const body = document.createElement('tbody');
  data.forEach((site) => {
    const siteRow = document.createElement('tr');
    let cell = document.createElement('td');
    cell.headers = 'site';
    cell.innerHTML = `${site.name}`;
    siteRow.appendChild(cell);
    cell = document.createElement('td');
    cell.innerHTML = `${site.climateZone}`;
    siteRow.appendChild(cell);
    cell = document.createElement('td');
    cell.innerHTML = `${site.normalisedBias}%`;
    siteRow.appendChild(cell);
    cell = document.createElement('td');
    cell.innerHTML = site.bias;
    siteRow.appendChild(cell);
    cell = document.createElement('td');
    cell.innerHTML = `${site.nmad}%`;
    siteRow.appendChild(cell);
    cell = document.createElement('td');
    cell.innerHTML = `${site.nrmsd}%`;
    siteRow.appendChild(cell);
    body.appendChild(siteRow);
  });
  table.appendChild(body);

  return table;
}

function renderStatsDetail(data) {
  resultsContainer.innerHTML = '';
  if (data.length === 0) {
    return;
  }
  const groupedByRegion = data.reduce((regions, item) => {
    const result = { ...regions };
    if (!result[item.region]) {
      result[item.region] = [];
    }
    result[item.region].push(item);
    return result;
  }, {});
  Object.entries(groupedByRegion).forEach(([region, items]) => {
    const regionHeader = document.createElement('h4');
    regionHeader.innerHTML = region;
    resultsContainer.appendChild(regionHeader);
    const dataTable = createResultsTableElement(items);
    resultsContainer.appendChild(dataTable);
  });
  updateResultsTableClasses(resultsContainer);
}

function initAccuracyData(first) {
  const climateZone = document.getElementById('climateZone').value;
  const region = document.getElementById('region').value;
  selectedZone = climateZone === '' ? 'All' : climateZone;
  selectedRegion = region === '' ? 'Global' : region;
  let query = `climateZone=${climateZone}&region=${region}`;
  if (accuracyVariant === 'forecast') {
    const season = document.getElementById('season').value;
    const param = document.getElementById('param').value;
    const period = document.getElementById('period').value;
    const includedhours = document.getElementById('includedhours').value;
    const statistic = document.getElementById('statistic').value;
    const normalise = document.getElementById('normalise').value;
    query += `&season=${season}&param=${param}&period=${period}&includedhours=${includedhours}&statistic=${statistic}&normalise=${normalise}`;
  }
  fetchStatsAll(query)
    .then((data) => {
      if (first) {
        setFilterFormOptions();
      }
      renderStatsSummary(data);
      renderStatsDetail(data.statistics);
      loadMapGeoJson(data.geojson);
    })
    .catch((error) => error);
}

map.on('load', () => {
  if (accuracyVariant === undefined) {
    summaryContainer.innerHTML = 'Error: accuracyVariant is not defined.';
    return;
  }
  if (accuracyVariant === 'forecast') {
    document.getElementById('forecastOptions').style.display = 'flex';
  }
  initAccuracyData(true);
  accuracyFilterForm.addEventListener('input', (event) => {
    event.preventDefault();
    initAccuracyData();
  });

  renderMapLegend();

  map.on('click', 'sites', (e) => {
    const coordinates = e.features[0].geometry.coordinates.slice();
    const description = `<strong>${e.features[0].properties.name}</strong><br>
    <table><tr><td>KGPV Zone</td><td>${e.features[0].properties.climateZone}</td></tr>
    <tr><td>Normalised Bias</td><td>${e.features[0].properties.normalisedBias}%</td></tr>
    <tr><td>Bias (W/m<sup>2</sup>)</td><td>${e.features[0].properties.bias}</td></tr>
    <tr><td>nMAD</td><td>${e.features[0].properties.nmad}%</td></tr>
    <tr><td>nRMSD</td><td>${e.features[0].properties.nrmsd}%</td></tr>
    </table>`;
    new mapboxgl.Popup({
      closeButton: false,
    })
      .setLngLat(coordinates)
      .setHTML(description)
      .addTo(map);
  });
  map.on('mouseenter', 'sites', () => {
    map.getCanvas().style.cursor = 'pointer';
  });
  map.on('mouseleave', 'sites', () => {
    map.getCanvas().style.cursor = '';
  });
});
