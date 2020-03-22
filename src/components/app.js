import React, { useEffect, useState } from 'react';
import "./app.css";

const divID = "ia_map";

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
        setMap(m);
      }
    };

    window.addEventListener("load", callback);
  }, []);

  return (
    <>
      <nav class="navbar navbar-light bg-light">
        <span class="navbar-brand mb-0 h1">Iowa COVID-19 Reported Cases</span>
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
