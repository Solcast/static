const accuracyApiUrl = 'https://web.solcast.com.au/api/accuracy';
const accuracyVariant = 'historic';
const accuracyToolContainer = document.getElementById('accuracyTool');
const accuracyFilterForm = document.getElementById('accuracyFilter');
const summaryContainer = document.getElementById('accuracySummary');
const resultsContainer = document.getElementById('accuracyStatistics');
const legendContainer = document.getElementById('accuracyMapLegend');
const accuracyRequestDataUrl = accuracyToolContainer.getAttribute('accuracy-data-url');

mapboxgl.accessToken = 'pk.eyJ1Ijoic29sY2FzdCIsImEiOiJjbHBrbmZybjUwMXhuMm5wZHZkYTl2cHgzIn0.JoR-him1ia9CPTHOTTNIXw';
const map = new mapboxgl.Map({
    container: 'accuracyMap',
    maxZoom: 6,
    minZoom: 1,
    zoom: 1,
    center: [40, 10],
    bounds: [[-180, -75], [180, 75]],
    style: 'mapbox://styles/solcast/clyzom3fx00ee01r5fw927na8',
    attributionControl: false
});
map.on('load', () => {

    if (accuracyVariant === undefined) {
        summaryContainer.innerHTML = `Error: accuracyVariant is not defined.`;
        return;
    }
    if (accuracyVariant === 'forecast') {
        document.getElementById('forecastOptions').style.display = 'flex';
    }
    initAccuracyData(true);
    accuracyFilterForm.addEventListener('input', function (event) {
        event.preventDefault();
        initAccuracyData();
    });

    renderMapLegend();

    map.on('click', 'sites', (e) => {
        var coordinates = e.features[0].geometry.coordinates.slice();
        var description = '<strong>' + e.features[0].properties.name + '</strong>';
        description += '<br>' + e.features[0].properties.location + '';
        description += '<table>';
        description += '<tr><td>KGPV Zone</td><td>' + e.features[0].properties.climateZone + '</td></tr>';
        description += '<tr><td>Normalised Bias</td><td>' + e.features[0].properties.normalisedBias + '%</td></tr>';
        description += '<tr><td>Bias (W/m<sup>2</sup>)</td><td>' + e.features[0].properties.bias + '</td></tr>';
        description += '<tr><td>nMAD</td><td>' + e.features[0].properties.nmad + '%</td></tr>';
        description += '<tr><td>nRMSD</td><td>' + e.features[0].properties.nrmsd + '%</td></tr>';
        description += '</table>';
        description += '<a href="' + accuracyRequestDataUrl + '" target="_blank">Request raw validation data</a>';

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

function renderMapLegend() {
    legendContainer.innerHTML = '';
    var legendItems = [
        { label: 'Tropical', color: '#f26e54' },
        { label: 'Desert', color: '#fcb82a' },
        { label: 'Steppe', color: '#838bc2' },
        { label: 'Temperate', color: '#98d09d' },
        { label: 'Cold', color: '#60a9d1' },
        { label: 'Polar', color: '#136aae' }
    ];
    legendItems.forEach(item => {
        var legendItem = document.createElement('div');
        legendItem.className = 'map-legend-item';
        var color = document.createElement('div');
        color.className = 'map-legend-color';
        color.style.backgroundColor = item.color;
        legendItem.appendChild(color);
        var label = document.createElement('div');
        label.className = 'map-legend-label';
        label.innerHTML = item.label;
        legendItem.appendChild(label);
        legendContainer.appendChild(legendItem);
    });
}

function initAccuracyData(first) {
    var climateZone = document.getElementById('climateZone').value;
    var region = document.getElementById('region').value;
    let query = `climateZone=${climateZone}&region=${region}`;
    if (accuracyVariant === 'forecast') {
        var season = document.getElementById('season').value;
        var param = document.getElementById('param').value;
        var period = document.getElementById('period').value;
        var includedhours = document.getElementById('includedhours').value;
        var statistic = document.getElementById('statistic').value;
        var normalise = document.getElementById('normalise').value;
        query += `&season=${season}&param=${param}&period=${period}&includedhours=${includedhours}&statistic=${statistic}&normalise=${normalise}`;
    }
    fetchStatsAll(query)
        .then(data => {
            if (first) {
                setFilterFormOptions();
            }
            renderStatsSummary(data);
            renderStatsDetail(data.statistics);
            loadMapGeoJson(data.geojson);
        })
        .catch(error => {
            console.error(error);
        });
}

function fetchStatsAll(query) {
    return new Promise((resolve, reject) => {
        fetch(`${accuracyApiUrl}/${accuracyVariant}?${query}`)
            .then(response => {
                resolve(response.json());
            })
            .catch(error => {
                reject(error);
            });
    });
}

function renderStatsSummary(data) {
    summaryContainer.innerHTML = '';
    if (data.statistics.length === 0) {
        summaryContainer.innerHTML = `No sites meet your criteria, please try again.`;
        map.setFilter('kgpv-climate-zones', null);
        return;
    }
    if (data.statistics.length < 5) {
        summaryContainer.innerHTML = `${data.statistics.length} site${data.statistics.length > 1 ? 's' : ''} meet${data.statistics.length === 1 ? 's' : ''} your criteria, see individual site results below. Not enough sites for a meaningful statistical summary.`;
        return;
    }
    var dataTable = createSummaryTableElement(data.summary);
    summaryContainer.appendChild(dataTable);
    updateSummaryTableClasses(summaryContainer);
}

function renderStatsDetail(data) {
    resultsContainer.innerHTML = '';
    if (data.length === 0) {
        return;
    }
    const groupedByRegion = data.reduce((regions, item) => {
        if (!regions[item.region]) {
            regions[item.region] = [];
        }
        regions[item.region].push(item);
        return regions;
    }, {});
    Object.entries(groupedByRegion).forEach(([region, items]) => {
        var regionHeader = document.createElement('h2');
        regionHeader.innerHTML = region;
        resultsContainer.appendChild(regionHeader);
        var dataTable = createResultsTableElement(items);
        resultsContainer.appendChild(dataTable);
    });
    updateResultsTableClasses(resultsContainer);
}

function loadMapGeoJson(data) {
    //map.on('styledata', function () {

        if (!map.getSource('sites')) {
            map.addSource('sites', {
                type: 'geojson',
                data: data
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
                    'circle-stroke-width': 1
                }
            });
        }

        if (data.features.length === 0) {
            map.fitBounds([[-180, -75], [180, 75]]);
            return;
        }
        var bounds = new mapboxgl.LngLatBounds();
        data.features.forEach(function (feature) {
            bounds.extend(feature.geometry.coordinates);
        });
        map.fitBounds(bounds, {
            padding: 100
        });

        var climateZone = document.getElementById('climateZone').value;
        var climateZoneIds = null;
        switch (climateZone) {
            case 'Polar':
                climateZoneIds = [1];
                break;
            case 'Cold':
                climateZoneIds = [2, 3];
                break;
            case 'Temperate':
                climateZoneIds = [4, 5, 6];
                break;
            case 'Tropical':
                climateZoneIds = [11, 12];
                break;
            case 'Desert':
                climateZoneIds = [9, 10];
                break;
            case 'Steppe':
                climateZoneIds = [7, 8];
                break;
            default:
                break;
        }

        if (climateZoneIds !== null) {
            map.setFilter('kgpv-climate-zones', ['match', ['get', 'zone'], climateZoneIds, true, false]);
        } else {
            map.setFilter('kgpv-climate-zones', null);
        }
    
}

function setFilterFormOptions() {
    fetch(`${accuracyApiUrl}/${accuracyVariant}/options`)
        .then(response => response.json())
        .then(data => {
            var selectElement = document.getElementById('climateZone');
            var options = data.find(option => option.field === 'climateZone').options;
            options.forEach(option => {
                var optionElement = document.createElement('option');
                optionElement.value = option;
                optionElement.text = option;
                selectElement.appendChild(optionElement);
            });
            var selectElement = document.getElementById('region');
            var options = data.find(option => option.field === 'region').options;
            options.forEach(option => {
                var optionElement = document.createElement('option');
                optionElement.value = option;
                optionElement.text = option;
                selectElement.appendChild(optionElement);
            });
            if (accuracyVariant === 'forecast') {
                var selectElement = document.getElementById('season');
                var options = data.find(option => option.field === 'season').options;
                options.forEach(option => {
                    var optionElement = document.createElement('option');
                    optionElement.value = option;
                    optionElement.text = option;
                    if (option === 'ALL') {
                        optionElement.selected = true;
                    }
                    selectElement.appendChild(optionElement);
                });
                var selectElement = document.getElementById('param');
                var options = data.find(option => option.field === 'param').options;
                options.forEach(option => {
                    var optionElement = document.createElement('option');
                    optionElement.value = option;
                    optionElement.text = option;
                    selectElement.appendChild(optionElement);
                });
                var selectElement = document.getElementById('period');
                var options = data.find(option => option.field === 'period').options;
                options.forEach(option => {
                    var optionElement = document.createElement('option');
                    optionElement.value = option;
                    optionElement.text = option;
                    selectElement.appendChild(optionElement);
                });
                var selectElement = document.getElementById('statistic');
                var options = data.find(option => option.field === 'statistic').options;
                options.forEach(option => {
                    var optionElement = document.createElement('option');
                    optionElement.value = option;
                    optionElement.text = option;
                    selectElement.appendChild(optionElement);
                });
            }
        });
}

function createSummaryTableElement(data) {
    var table = document.createElement('table');
    // table header
    var head = document.createElement('thead');
    var headerRowLabels = ['Normalised Bias', 'Bias (W/m<sup>2</sup>)', 'nMAD', 'nRMSD'];
    var row = document.createElement('tr');
    headerRowLabels.forEach(label => {
        var cell = document.createElement('td');
        cell.innerHTML = label;
        row.appendChild(cell);
    });
    head.appendChild(row);
    table.appendChild(head);
    // table body
    var body = document.createElement('tbody');
    var row = document.createElement('tr');
    cell = document.createElement('td');
    cell.innerHTML = `${data.normalisedBiasMean}%<br>(${data.normalisedBiasMin}% to ${data.normalisedBiasMax}%)`;
    row.appendChild(cell);
    cell = document.createElement('td');
    cell.innerHTML = `${data.biasMean}<br>(${data.biasMin} to ${data.biasMax})`;
    row.appendChild(cell);
    cell = document.createElement('td');
    cell.innerHTML = `${data.nmadMean}%<br>(${data.nmadMin}% to ${data.nmadMax}%)`;
    row.appendChild(cell);
    cell = document.createElement('td');
    cell.innerHTML = `${data.nrmsdMean}%<br>(${data.nrmsdMin}% to ${data.nrmsdMax}%)`;
    row.appendChild(cell);
    body.appendChild(row);
    table.appendChild(body);

    return table;
}

function createResultsTableElement(data) {

    //sort by name
    data.sort((a, b) => {
        return a.name.localeCompare(b.name);
    });

    var table = document.createElement('table');
    // table header
    var head = document.createElement('thead');
    var headerRowLabels = ['Site', 'KGPV Zone', 'Normalised Bias', 'Bias (W/m<sup>2</sup>)', 'nMAD', 'nRMSD'];
    var row = document.createElement('tr');
    headerRowLabels.forEach(label => {
        var cell = document.createElement('td');
        cell.innerHTML = label;
        row.appendChild(cell);
    });
    head.appendChild(row);
    table.appendChild(head);
    // table body
    var body = document.createElement('tbody');
    data.forEach(site => {
        var row = document.createElement('tr');
        var cell = document.createElement('td');
        cell.headers = 'site';
        cell.innerHTML = `${site.name}<br>${site.location}<br>${site.region}`;
        row.appendChild(cell);
        cell = document.createElement('td');
        cell.innerHTML = `${site.climateZone}`;
        row.appendChild(cell);
        cell = document.createElement('td');
        cell.innerHTML = `${site.normalisedBias}%`;
        row.appendChild(cell);
        cell = document.createElement('td');
        cell.innerHTML = site.bias;
        row.appendChild(cell);
        cell = document.createElement('td');
        cell.innerHTML = `${site.nmad}%`;
        row.appendChild(cell);
        cell = document.createElement('td');
        cell.innerHTML = `${site.nrmsd}%`;
        row.appendChild(cell);
        body.appendChild(row);
    });
    table.appendChild(body);

    return table;
}

function updateResultsTableClasses(parentElement) {
    // apply table classes used in webflow pages
    var table = parentElement.getElementsByTagName('table');
    for (var i = 0; i < table.length; i++) {
        table[i].className = 'table table_col-6';
    }
    var headers = parentElement.getElementsByTagName('thead');
    for (var i = 0; i < headers.length; i++) {
        headers[i].className = 'table_head';
    }
    var body = parentElement.getElementsByTagName('tbody');
    for (var i = 0; i < body.length; i++) {
        body[i].className = 'table_body';
    }
    var cells = parentElement.getElementsByTagName('td');
    for (var i = 0; i < cells.length; i++) {
        if (cells[i].getAttribute('headers') === 'site') {
            cells[i].className = 'td table_cell cell-align-left';
        } else {
            cells[i].className = 'td table_cell';
        }
    }
    var rows = parentElement.getElementsByTagName('tr');
    for (var i = 0; i < rows.length; i++) {
        rows[i].className = 'table_row';
    }
}

function updateSummaryTableClasses(parentElement) {
    // apply table classes used in webflow pages
    var table = parentElement.getElementsByTagName('table');
    for (var i = 0; i < table.length; i++) {
        table[i].className = 'table table_col-4';
    }
    var headers = parentElement.getElementsByTagName('thead');
    for (var i = 0; i < headers.length; i++) {
        headers[i].className = 'table_head';
    }
    var body = parentElement.getElementsByTagName('tbody');
    for (var i = 0; i < body.length; i++) {
        body[i].className = 'table_body';
    }
    var cells = parentElement.getElementsByTagName('td');
    for (var i = 0; i < cells.length; i++) {
        cells[i].className = 'td table_cell';
    }
    var rows = parentElement.getElementsByTagName('tr');
    for (var i = 0; i < rows.length; i++) {
        rows[i].className = 'table_row';
    }
}