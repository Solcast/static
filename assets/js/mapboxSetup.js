/* global mapboxgl */
const config = window.mapboxConfig;
let marker;
let map;

let userInteracting = false;
const attributes = {};

const mapboxController = document.querySelector(".mapbox-wrapper");
// get all data attributes from mapboxController
// and set them as properties on the config object
for (let i = 0; i < mapboxController.attributes.length; i += 1) {
  const attr = mapboxController.attributes[i];
  if (attr.name.startsWith("mapbox-")) {
    const key = attr.name;
    const value = attr.value;
    attributes[key] = value;
  }
}

// Functions
const spinGlobe = () => {
  const zoom = map.getZoom();
  if (!userInteracting && config.spinGlobe && zoom < config.maPxSpinZoom) {
    const distancePerSecond = 360 / config.secondsPerRotation;
    const center = map.getCenter();
    center.lng -= distancePerSecond;
    // Smoothly animate the map over one second.
    // When this animation is complete, it calls a 'moveend' event.
    map.easeTo({ center, "duration": 1000, "easing": (n) => n });
  }
};

const getDataFromClick = (lngLat) => {
  const dataUrl = `https://tiles.solcast.com.au/prod/cog/point/${lngLat.lng},${lngLat.lat}?url=${config.tileUrl}`;
  return new Promise((resolve, reject) => {
    fetch(dataUrl)
      .then((response) => response.json())
      .then((data) => {
        resolve(data.values[0]);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

const getLocationNameFromClick = (lngLat) => {
  const locationUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lngLat.lng},${lngLat.lat}.json?access_token=${config.accessToken}`;
  return new Promise((resolve, reject) => {
    fetch(locationUrl)
      .then((response) => response.json())
      .then((locationData) => {
        resolve(
          locationData.features.find((x) => x.place_type[0] === "place")
            ? locationData.features
              .find((x) => x.place_type[0] === "place")
              .place_name.toString()
            : `${lngLat.lat.toFixed(5)}, ${lngLat.lng.toFixed(5)}`,
        );
      })
      .catch((error) => {
        reject(error);
      });
  });
};

const addRemoveLayer = (layerId) => {
  const visibility = map.getLayoutProperty(layerId, "visibility");
  if (visibility === "visible") {
    map.setLayoutProperty(layerId, "visibility", "none");
  } else if (visibility === "none") {
    map.setLayoutProperty(layerId, "visibility", "visible");
  } else {
    map.setLayoutProperty(layerId, "visibility", "none");
  }
};

const generateHtmlFromProperties = (properties, title, link, linkText) => {
  let html = "<div style='display:flex;flex-direction:column;'>";
  if (title.length > 0) {
    html += `<div class="flex-popup-title"><span>${title}</span></div>`;
  }
  Object.keys(properties).forEach((property) => {
    html += `<div class="flex-popup-row"><span>${property}</span><span>${properties[property]}</span></div>`;
  });
  if (link.length > 0) {
    html += `<a href="${link}" target="_blank">${linkText}</a>`;
  }
  html += "</div>";
  return html;
};

// Legend
if (config.showLegend) {
  // if (config.showLegend) {
  const legend = document.getElementById("mapbox-legend");
  const wrapper = document.querySelector(".legend-wrapper");
  legend.classList.add(config.legend.color);
  if (config.legend.size) {
    legend.classList.add(`legend-${config.legend.size}`);
  }
  if (config.legend.position) {
    config.legend.position.split(" ").forEach((element) => {
      wrapper.classList.add(`legend-${element}`);
    });
  }
}

// Icon Legend
if (config.showIconLegend) {
  const iconLegend = document.querySelector(".icon-legend-wrapper");
  iconLegend.innerHTML = "";
  config.icons.forEach((icon) => {
    const iconDiv = document.createElement("div");
    iconDiv.classList.add("icon-legend-item");
    iconDiv.onclick = () => {
      addRemoveLayer(icon.layer_id);
    };
    iconDiv.innerHTML = `<img src="${icon.url}" alt="${icon.id}" /><span>${icon.name}</span>`;
    iconLegend.appendChild(iconDiv);
  });
}

mapboxgl.accessToken = config.accessToken;
map = new mapboxgl.Map({
  "container": "map",
  "attributionControl": false,
  "style": config.style,
  "center": config.location.center,
  "projection": config.location.projection,
  "zoom": config.location.zoom,
  "minZoom": config.location.minZoom,
  "maxZoom": config.location.maxZoom,
  "pitch": config.location.pitch,
  "bearing": config.location.bearing,
});

if (config.showControls) {
  map.addControl(new mapboxgl.NavigationControl());
}

// map.dragRotate.disable();

// Pause spinning on interaction
map.on("mousedown", () => {
  userInteracting = true;
});

// Restart spinning the globe when interaction is complete
// map.on("mouseup", () => {
//   userInteracting = false;
//   spinGlobe(map);
// });

// // These events account for cases where the mouse has moved
// // off the map, so 'mouseup' will not be fired.
// map.on("dragend", () => {
//   userInteracting = false;
//   spinGlobe(map);
// });

map.on("pitchend", () => {
  userInteracting = false;
  spinGlobe(map);
});
map.on("rotateend", () => {
  userInteracting = false;
  spinGlobe(map);
});
map.on("moveend", () => {
  spinGlobe(map);
});

// Popup functionality
config.layers.forEach((layer) => {
  if (layer.allowPopup) {
    map.on("click", layer.id, (e) => {
      const features = map
        .queryRenderedFeatures(e.point)
        .find((f) => f.layer.id === layer.id);
      // properties are mapped to user defined column names
      const properties = {};
      for (let i = 0; i < layer.propertiesToShow.length; i += 1) {
        properties[layer.propertyColumnNames[i]] = features.properties[layer.propertiesToShow[i]];
      }
      let title = "";
      if (layer.popupTitle) {
        title = features.properties[layer.popupTitle];
      }
      let link = "";
      let linkText = "";
      if (layer.popupLink && layer.popupLinkText) {
        link = layer.popupLink;
        linkText = layer.popupLinkText;
      }
      new mapboxgl.Popup({ "closeOnClick": true, "className": "flex-popup" })
        .setLngLat(e.lngLat)
        .setHTML(generateHtmlFromProperties(properties, title, link, linkText))
        .addTo(map);
    });
  }
});

if (config.showMarkers) {
  marker = new mapboxgl.Marker({
    "draggable": true,
    "color": config.markerColor,
  })
    .setLngLat(config.location.center)
    .addTo(map);
}

map.on("click", (e) => {
  // check that none of the features have the same id as any of the layers
  // if they do, then we don't want to do anything
  const features = map.queryRenderedFeatures(e.point);
  for (let i = 0; i < features.length; i += 1) {
    if (config.layers.find((x) => x.id === features[i].layer.id)) {
      return;
    }
  }

  Promise.all([
    getDataFromClick(e.lngLat),
    getLocationNameFromClick(e.lngLat),
  ]).then(([data, locationName]) => {
    let innerHTML = `<div class="flex-popup-title">${locationName}</div>`;
    innerHTML += `<div class="flex-popup-row"><span>GHI</span><span>${(
      data * config.tileDataScalar
    ).toFixed(0)} ${config.tileDataMeasurement}</span></div>`;

    new mapboxgl.Popup({ "closeOnClick": true, "className": "flex-popup" })
      .setLngLat(e.lngLat)
      .setHTML(innerHTML)
      .addTo(map);
  });
  if (config.showMarkers) {
    marker.setLngLat(e.lngLat);
  }
});

map.on("load", () => {
  // 3D Terrain
  if (config.use3dTerrain) {
    map.addSource("mapbox-dem", {
      "type": "raster-dem",
      "url": "mapbox://mapbox.mapbox-terrain-dem-v1",
      "tileSize": 512,
      "maxzoom": 14,
    });

    map.setTerrain({ "source": "mapbox-dem", "exaggeration": 1.5 });
  }

  // Add all layers from config
  config.layers.forEach((layer) => {
    map.addLayer(layer, layer.depth);
  });
  // Load all icons from config
  config.icons.forEach((icon) => {
    map.loadImage(icon.url, (error, image) => {
      if (error) throw error;
      map.addImage(icon.id, image);
    });
  });
  if (config.showStars) {
    map.setFog({
      "color": "rgb(186, 210, 235)", // Lower atmosphere
      "high-color": "rgb(36, 92, 223)", // Upper atmosphere
      "horizon-blend": 0.02, // Atmosphere thickness (default 0.2 at low zooms)
      "space-color": "rgb(11, 11, 25)", // Background color
      "star-intensity": 0.6, // Background star brightness (default 0.35 at low zoooms )
    });

    map.addLayer({
      "id": "sky",
      "type": "sky",
      "paint": {
        "sky-type": "atmosphere",
        "sky-atmosphere-sun": [0.0, 0.0],
        "sky-atmosphere-sun-intensity": 15,
      },
    });
  }
});

spinGlobe(map);

// Attempt to get the location from query params
const params = new Proxy(new URLSearchParams(window.location.search), {
  "get": (target, prop) => target.get(prop.toString()),
});

const flyToLocation = [params.longitude, params.latitude];

// Fly to location if query params are present
if (flyToLocation[0] && flyToLocation[1]) {
  map.flyTo({
    "center": flyToLocation,
    "zoom": 4,
    "duration": 5000,
  });
}
