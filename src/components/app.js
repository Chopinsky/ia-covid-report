import React, { useEffect, useState } from 'react';
import "./app.css";
import iaGeoJSON from "../data/ia_2500k.json";

const divID = "ia_map";
let L, geoJson;

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

function getColor(d) {
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
    opacity: 0.8,
    color: "white",
    dashArray: "3",
    fillOpacity: 0.4
  };
}

function App() {
  const [_map, setMap] = useState(null);

  useEffect(() => {
    const callback = _evt => {
      window.removeEventListener("load", callback);

      if (window.L) {
        L = window.L;

        /** 
         * use mapbox
         *
        const m = L.map(divID, {
          maxBounds: L.latLngBounds(
            L.latLng(50, -100),
            L.latLng(30, -80)
          )
        }).setView([41.9868, -93.625], 7);

        L.tileLayer(
          "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw",
          {
            maxZoom: 12,
            attribution:
              'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
              '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
              'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
            id: "mapbox/light-v9",
            tileSize: 512,
            zoomOffset: -1
          }
        ).addTo(m);
        */

        /** */
        const m = L.map(divID, {
          center: new L.LatLng(41.9868, -93.625),
          zoom: 7,
        });
        
        const layer = new L.StamenTileLayer("toner"); //terrain");
        m.addLayer(layer);

        /**
         *  add overlay
        L.LabelOverlay = L.Class.extend({
          initialize: function(
            latLng,
            label,
            options
          ) {
            this._latlng = latLng;
            this._label = label;
            L.Util.setOptions(this, options);
          },
          options: {
            offset: new L.Point(0, 2)
          },
          onAdd: function(map) {
            this._map = map;
            if (!this._container) {
              this._initLayout();
            }

            this._container.innerHTML = this._label;
            map.getPanes().overlayPane.appendChild(this._container);
            map.on("viewreset", this._reset, this);

            this._reset();
          },
          onRemove: function(map) {
            map.getPanes().overlayPane.removeChild(this._container);
            map.off("viewreset", this._reset, this);
          },
          _reset: function() {
            const pos = this._map.latLngToLayerPoint(this._latlng);

            const op = new L.Point(
              pos.x + this.options.offset.x,
              pos.y - this.options.offset.y
            );

            L.DomUtil.setPosition(this._container, op);
          },
          _initLayout: function() {
            this._container = L.DomUtil.create(
              "div",
              "__leaflet-label-overlay"
            );
          }
        });

        const loc = new L.LatLng(-96.327706, 42.249992);
        const titleLayer = new L.LabelOverlay(loc, "<b>COUNTY -- AMES</b>");
        m.addLayer(titleLayer);
        */

        geoJson = L.geoJson(iaGeoJSON, {
          style: style,
          onEachFeature: onEachFeature
        })
        .bindTooltip(function(layer) {
          return layer.feature.properties.NAME;
        })
        .addTo(m);

        const loc = new L.latLng(42.383745, -94.397182);
        L.marker(loc, {
          icon: L.divIcon({
            className: "text-labels", // Set class for CSS styling
            html: "<b>A Text Label</b>"
          }),
          zIndexOffset: 1000 // Make appear above other map features
        }).addTo(m);

        setMap(m);
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
