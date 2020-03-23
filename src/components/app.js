import React, { useEffect, useState } from 'react';
import "./app.css";
import iaGeoJSON from "../data/ia_2500k.json";

const divID = "ia_map";
let printed = false;

function getColor(d) {
  if (!printed) {
    console.log("data", d);
    printed = true;
  }

  return d > 90
    ? "#800026"
    : d > 80
    ? "#BD0026"
    : d > 70
    ? "#E31A1C"
    : d > 60
    ? "#FC4E2A"
    : d > 50
    ? "#FD8D3C"
    : d > 20
    ? "#FEB24C"
    : d > 10
    ? "#FED976"
    : "#FFEDA0";
}

function style(feature) {
  return {
    fillColor: getColor(parseInt(feature.properties.COUNTY)),
    weight: 2,
    opacity: 1,
    color: "white",
    dashArray: "3",
    fillOpacity: 0.7
  };
}

function App() {
  const [_map, setMap] = useState(null);

  useEffect(() => {
    const callback = _evt => {
      window.removeEventListener("load", callback);

      if (window.L) {
        const { L } = window;

        const layer = new L.StamenTileLayer("toner"); //terrain");
        const m = L.map(divID, {
          center: new L.LatLng(41.9868, -93.625),
          zoom: 7,
        });

        m.addLayer(layer);
        L.geoJson(iaGeoJSON, {
          style: style,
        }).addTo(m);

        setMap(m);


        /** 
         * use mapbox
         *
        const map = L.map(divID).setView([37.8, -96], 4);

        L.tileLayer(
          "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw",
          {
            maxZoom: 18,
            attribution:
              'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
              '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
              'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
            id: "mapbox/light-v9",
            tileSize: 512,
            zoomOffset: -1
          }
        ).addTo(map);

        const _geojson = L.geoJson(iaGeoJSON).addTo(map);
        setMap(map);
        */
      }
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
            <div id={divID} style={{ minHeight: "480px", width: "100%" }}></div>
          </div>
          <div className="col-sm"></div>
        </div>
      </div>
    </>
  );
}

export default App;
