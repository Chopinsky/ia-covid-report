'use strict'

const fs = require("fs");
const path = require("path");

const source = "../data/ia_raw/us_5m.json";
const dest = "../data/ia_geo_json/ia_5m.json";

exports.processGeoData = function () {
  const content = JSON.parse(fs.readFileSync(path.resolve(__dirname, source)).toString());
  if (!content) {
    console.error('[error] nothing read ... ');
    return;
  }

  const { features } = content;
  const iowa = {
    type: "FeatureCollection", 
    features: [],
  };

  for (let i = 0; i < features.length; i++) {
    const county = features[i];
    const state = parseInt(county.properties.STATE);

    if (state < 19) {
      continue;
    } else if (state > 19) {
      break;
    }

    iowa.features.push(county);
  }

  fs.writeFileSync(path.resolve(__dirname, dest), JSON.stringify(iowa));
}