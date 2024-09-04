window.mapboxConfig = {
  "style": 'mapbox://styles/solcast/clxjli2z6008h01pudwyx80kx',
  "accessToken":
    'pk.eyJ1Ijoic29sY2FzdCIsImEiOiJjbHBrbmZybjUwMXhuMm5wZHZkYTl2cHgzIn0.JoR-him1ia9CPTHOTTNIXw',
  "showMarkers": false,
  "markerColor": '#3FB1CE',
  "showControls": true,
  "showLegend": false,
  "legend": {
    // title: "GHI (Long-term av erage annual total, kWh/m<sup>2</sup>/yr)",
    // color: "gist_ncar",
    // position: "bottom center", // top | bottom, left | right | center
    // size: "small", // small | large
    "min": 0,
    "max": 308,
  },
  "showIconLegend": true,
  "use3dTerrain": false,
  "spinGlobe": true,
  "secondsPerRotation": 180,
  "maxSpinZoom": 2,
  "showStars": true,
  "title": 'Long Term Average Solar Rad',
  "subtitle": 'Subtitle',
  "location": {
    "center": [0, 0],
    "projection": 'globe',
    "zoom": 1,
    "minZoom": 1,
    "maxZoom": 10,
    "pitch": 0,
    "bearing": 0,
  },
  "tileUrl":
    's3://solcast-visualisation-prod/longterm-average/long_term_avg_40k.tif',
  "tileDataMeasurement": 'kWh/m<sup>2</sup>/yr',
  "tileDataScalar": 8.76,
  "layers": [
    {
      "id": 'ocean_highres',
      "type": 'fill',
      "source": {
        "type": 'vector',
        "url": 'mapbox://mapbox.mapbox-streets-v8',
      },
      'source-layer': 'water',
      "paint": {
        'fill-color': '#205787',
      },
      "minzoom": 0,
    },
    {
      "id": 'ocean_ne_10m',
      "type": 'fill',
      "source": {
        "type": 'vector',
        "url": "mapbox://solcast.66a5o032",
      },
      'source-layer': 'ne_10m_ocean-3smy0z',
      "paint": {
        'fill-color': '#205787',
      },
      "minzoom": 0,
    },
    {
      "id": 'long-term-avg',
      "type": 'raster',
      "source": {
        "type": 'raster',
        "tiles": [
          'https://tiles.solcast.com.au/prod/cog/tiles/{z}/{x}/{y}@1x?url=s3://solcast-visualisation-prod/longterm-average/long_term_avg_40k.tif&rescale=0,308&colormap_name=gist_ncar',
        ],
        "tileSize": 256,
        "attribution": '&copy; <a href="https://solcast.com/">Solcast</a>',
      },
      "paint": {
        'raster-opacity': 0.9,
      },
      "depth": 'admin-1-boundary',
      "allowPopup": true,
    },
    {
      "id": 'large_utility',
      "type": 'symbol',
      "source": {
        "type": 'vector',
        "url": 'mapbox://solcast.495m93n3',
        "attribution":
          '&copy; <a href="https://globalenergymonitor.org/projects/global-solar-power-tracker/">GEM</a>',
      },
      'source-layer': 'GEM_large_utility-dt8kss',
      "filter": ['==', ['get', 'Status'], 'operating'],
      "layout": {
        'icon-image': 'utility',
        'icon-size': [
          'interpolate',
          ['linear'],
          ['zoom'],
          5,
          [
            'interpolate',
            ['linear'],
            ['get', 'Capacity (MW)'],
            10,
            0.1,
            100,
            0.2,
            1000,
            0.3,
            5000,
            0.4,
            8000,
            0.5,
          ],
          8,
          [
            'interpolate',
            ['linear'],
            ['get', 'Capacity (MW)'],
            10,
            0.4,
            100,
            0.6,
            1000,
            0.8,
            5000,
            1,
            8000,
            1.2,
          ],
        ],
        'icon-allow-overlap': true,
        'icon-ignore-placement': true,
      },
      "minzoom": 4,
      "paint": {
        'icon-opacity': ['interpolate', ['linear'], ['zoom'], 5, 0.5, 8, 1],
      },
      "allowPopup": true,
      "propertiesToShow": ['Capacity (MW)'],
      "propertyColumnNames": ['Capacity (MW)'],
      "popupTitle": 'Project Name',
    },
    {
      "id": 'bankability',
      "type": 'symbol',
      "source": {
        "type": 'geojson',
        "data": 'https://web.solcast.com.au/api/accuracy/historic/geojson',
      },
      "layout": {
        'icon-image': 'bankable',
        'icon-size': 0.2,
        'icon-allow-overlap': true,
      },
      "paint": {
        'icon-opacity': 1,
      },
      "minzoom": 1,
      "allowPopup": true,
      "propertiesToShow": [
        'climateZone',
        'bias',
        'normalisedBias',
        'nmad',
        'nrmsd',
      ],
      "propertyColumnNames": [
        'KGPV Zone',
        'Bias (W/m<sup>2</sup>)',
        'Normalised Bias (%)',
        'nMAD (%)',
        'nRMSD (%)',
      ],
      "popupTitle": 'name',
      "popupLink": 'https://solcast.com/validation-and-accuracy',
      "popupLinkText": 'Read the bankability report',
    },
  ],
  "icons": [
    {
      "url": 'https://static.solcast.com/assets/icons/validation_sites.png',
      "id": 'bankable',
      "name": 'Validation Sites',
      "layer_id": 'bankability',
    },
    {
      "url": 'https://static.solcast.com/assets/icons/solar_sites.png',
      "id": 'utility',
      "name": 'Solar Sites',
      "layer_id": 'large_utility',
    },
    {
      "url": 'https://static.solcast.com/assets/icons/lta_icon.png',
      "id": 'lta',
      "name": 'Long Term Average',
      "layer_id": 'long-term-avg',
    },
  ],
};
