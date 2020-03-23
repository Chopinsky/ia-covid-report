import React, { useEffect, useState } from 'react';
import "./app.css";
import iaGeoJSON from "../data/ia_2500k.json";
import cases from "../data/2020-03-22.json";

const divID = "ia_map";
const grades = [0, 2, 8, 16, 32, 64, 128];

let useMapbox = false;
let L, geoJson, allCases;

function onEachFeature(feature, layer) {
  layer.on({
    mouseover: e => highlightFeature(e, feature, layer),
    mouseout: resetHighlight,
    // click: zoomToFeature
  });
}

function highlightFeature(_evt, feature, baseLayer) {
  baseLayer.setStyle({
    weight: 4,
    color: "#666",
    dashArray: "",
    fillOpacity: 0.7
  });

  // console.log(feature.properties.NAME);

  if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
    baseLayer.bringToFront();
  }
}

function resetHighlight(e) {
  if (geoJson) {
    geoJson.resetStyle(e.target);
  }
}

function getColor(name, number) {
  if (typeof number !== 'number') {
    if (!name) {
      return "#FFFFFF";
    }

    let county = allCases[name];
    if (!county) {
      return "#FFFFFF";
    }

    number = county["Confirmed"];    
  }

  return number > grades[6]
    ? "#800026"
    : number > grades[5]
    ? "#BD0026"
    : number > grades[4]
    ? "#E31A1C"
    : number > grades[3]
    ? "#FC4E2A"
    : number > grades[2]
    ? "#FD8D3C"
    : number > grades[1]
    ? "#FEB24C"
    : number > grades[0]
    ? "#FED976"
    : "#FFFFFF";
}

function style(feature) {
  return {
    fillColor: getColor(feature.properties.NAME),
    weight: 1.2,
    opacity: 0.4,
    color: "black",
    dashArray: "3",
    fillOpacity: 0.4
  };
}

function legendDisplay(grade) {
  if (grade < 10) {
    return `<span style="padding-left: 14px;"> ${grade}</span>`;
  } else if (grade < 100) {
    return `<span style="padding-left: 7px;"> ${grade}</span>`;
  }

  return `<span>${grade}</span>`;
}

function App() {
  const [map, setMap] = useState(null);
  const [dayCase, setDayCase] = useState(null);

  if (!dayCase) {
    setDayCase(cases);    
  }

  const renderLegend = (L, map) => {
    let legend = L.control({ position: 'bottomright' });

    legend.onAdd = function (map) {
      const div = L.DomUtil.create('div', 'info legend');
      const grades = [0, 2, 8, 16, 32, 64, 128];

      div.innerHTML += `<p style="margin-bottom: 4px; line-height: 1;">Confirmed <br> Cases</p>`

      // loop through our density intervals and generate a label with a colored square for each interval
      for (let i = 0; i < grades.length; i++) {
        div.innerHTML +=
          `<i style="background-color:${getColor(null, grades[i])}; border: 0.5px solid rgb(0, 0, 0, 0.5);"></i>`;
        
        div.innerHTML += legendDisplay(grades[i]) + (grades[i + 1] ? '<br>' : '+');
      }

      return div;
    };

    legend.addTo(map);
  }

  // if day cases 
  useEffect(() => {
    allCases = {};

    dayCase.forEach(county => {
      allCases[county["Name"]] = county;
    });

    if (map && geoJson) {
      geoJson.resetStyle();
    }
  }, [map, dayCase]);

  useEffect(() => {
    let initDayCase = dayCase ? dayCase : cases || [];
    allCases = {};

    initDayCase.forEach(county => {
      allCases[county["Name"]] = county;
    });

    const callback = _evt => {
      window.removeEventListener("load", callback);

      if (!window.L) {
        console.error("[error] failed to initialize the map ... ");
        return;
      }

      L = window.L;
      let m;

      if (useMapbox) {
        /** 
         * use mapbox
         */
        m = L.map(divID, {
          maxBounds: L.latLngBounds(
            L.latLng(50, -100),
            L.latLng(30, -80)
          )
        }).setView([41.9868, -93.625], 7);

        L.tileLayer(
          "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw",
          {
            maxZoom: 10,
            attribution:
              'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
              '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
              'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
            id: "mapbox/light-v9",
            tileSize: 512,
            zoomOffset: -1
          }
        ).addTo(m);
      } else {
        /** 
         * by default, use Stamen tiles
         */
        m = L.map(divID, {
          center: new L.LatLng(41.9868, -93.625),
          maxBounds: L.latLngBounds(
            L.latLng(50, -100),
            L.latLng(36, -86)
          ),
          zoom: 7,
        });
        
        const layer = new L.StamenTileLayer("toner"); //terrain");
        m.addLayer(layer);
      }

      geoJson = L.geoJson(iaGeoJSON, {
        style: style,
        onEachFeature: onEachFeature
      })
      .bindTooltip(function(layer) {
        let name = layer.feature.properties.NAME;
        if (name) {
          let countyInfo = allCases[name];
          if (countyInfo) {
            return name + ": " + countyInfo["Confirmed"];
          }
        }

        return name + ": 0";
      })
      .addTo(m);

      renderLegend(L, m);

      setMap(m);
    };

    window.addEventListener("load", callback);
  }, []);

  return (
    <>
      <nav className="navbar navbar-light bg-light">
        <span className="navbar-brand mb-0 h1">
          Iowa COVID-19 Reported Cases
        </span>
      </nav>
      <div className="container-fluid container-padding">
        <div className="row">
          <div className="col-sm"></div>
          <div className="col-6">
            <div className={"d-flex justify-content-center m-2"}>
              <h5>Last updated on: 03-22-2020 4:00PM CST</h5>
            </div>
            <div id={divID} style={{ minHeight: "480px", width: "100%" }}></div>
          </div>
          <div className="col-sm"></div>
        </div>
      </div>
    </>
  );
}

export default App;
