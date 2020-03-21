'use restrict'

const axios = require("axios");
const fs = require("fs");
const path = require('path');

const url =
  "https://services.arcgis.com/vPD5PVLI6sfkZ5E4/arcgis/rest/services/IA_COVID19_Cases/FeatureServer/0/query?f=json&where=(Confirmed%20%3C%3E%200)%20AND%20(Confirmed%3C%3E0)&returnGeometry=false&spatialRel=esriSpatialRelIntersects&outFields=*&orderByFields=Confirmed%20desc&resultOffset=0&resultRecordCount=100&cacheHint=true";
const directory = "../data/daily";
const aggDest = "../data/summary/aggregated.json";

exports.fetch = function(date) {
  console.log('fetching data for:', date, '...');

  axios
    .get(url)
    .then(({ data }) => {
      if (!data || !data.features) {
        return;
      }

      // update the aggregated report
      if (!date) {
        const dateTime = new Date().toISOString().split("T");
        date = dateTime[0];
      }

      const destPath = path.resolve(__dirname, aggDest);

      let content = JSON.parse(fs.readFileSync(destPath).toString()) || {};
      let casesByCounty = [];
      let total = 0;

      data.features.forEach(d => {
        const { attributes } = d;

        if (attributes) {
          casesByCounty.push(attributes);

          if (!content.hasOwnProperty(attributes["Name"])) {
            content[attributes["Name"]] = {
              id: attributes["IACountyID"],
              confirmed: []
            };
          }

          let arr = content[attributes["Name"]]["confirmed"];

          if (arr.length > 0 && arr[arr.length - 1]["date"] === date) {
            // upate the entry
            arr.pop();
          }

          arr.push({
            date,
            number: attributes["Confirmed"] || 0
          });

          total += attributes["Confirmed"] || 0;
        }
      });

      if (casesByCounty.length === 0) {
        return;
      }

      if (!content.hasOwnProperty("total")) {
        content["total"] = [];
      }

      content["total"].push({
        date,
        number: total
      });

      // write the daily report
      const filePath = path.resolve(
        __dirname,
        directory,
        date + ".json"
      );

      fs.writeFileSync(filePath, JSON.stringify(casesByCounty));
      fs.writeFileSync(destPath, JSON.stringify(content));
    })
    .catch(error => {
      console.error("[error] failed to retrieve data:", error);
    });
};

