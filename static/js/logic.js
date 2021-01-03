// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
});



// Define a function we want to run once for each feature in the features array
function createFeatures(earthquakeData) {

    // Give each feature a popup describing the place and time of the earthquake
    function onEachFeature(feature, layer) {
      layer.bindPopup("<h3>" + "magnitude: " + feature.properties.mag + ", " + feature.properties.place +
        "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
    }

    // Create a GeoJSON layer containing the features array on the earthquakeData object
    // Run each of below function once for each piece of data in the array
    var earthquakes = L.geoJSON(earthquakeData, {
      onEachFeature: onEachFeature,
      pointToLayer: pointToLayer
    });
  
    // Sending our earthquakes layer to the createMap function
    createMap(earthquakes);
  }

// Create the marker size and colour
function markerSize(magnitude) {
    return magnitude * 7;
}

function getColor(magnitude) {
    if (magnitude > 5) {
        return '#cc4e01'
    } else if (magnitude > 4) {
        return '#ff7802'
    } else if (magnitude > 3) {
        return '#fec855'
    } else if (magnitude > 2) {
        return '#ffff55'
    } else if (magnitude > 1) {
        return '#ffffaa'
    } else {
        return '#cbe927'
    }
};

function pointToLayer(feature, location) {
    var options = {
        stroke: true,
        color: 'grey',
        fillColor: getColor(feature.properties.mag),
        radius: markerSize(feature.properties.mag),
        fillOpacity: 0.75
    }

    return L.circleMarker(location, options);
}

L.geoJson(magnitude, {pointToLayer: pointToLayer}).addTo(myMap);

// create maps for both street and dark views.
function createMap(earthquakes) {

    var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "mapbox/streets-v11",
        accessToken: API_KEY
    });

    var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "dark-v10",
        accessToken: API_KEY
    });

    // Define a baseMaps object to hold our base layers
    var baseMaps = {
        "Street Map": streetmap,
        "Dark Map": darkmap
    };

    // Create overlay object to hold our overlay layer
    var overlayMaps = {
        Earthquakes: earthquakes
    };

    // Create our map, giving it the streetmap and earthquakes layers to display on load
    var myMap = L.map("map", {
        center: [
        37.09, -95.71
        ],
        zoom: 5,
        layers: [streetmap, earthquakes]
    });


// Create legend to provide context for the map data
var legend = L.control({position: 'bottomright'});

legend.onAdd = function (myMap) {

    var div = L.DomUtil.create('div', 'info legend'),
        grades = [0,1,2,3,4,5],
        labels = [];

    // loop through the intervals and generate a label with a colored square for each interval
    
    for (var i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style="background:' + getColor(grades[i] + 1) + '"></i> '+
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
        }
    
    return div;
};

legend.addTo(myMap);


// Create a layer control
L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
}).addTo(myMap);
}
  

