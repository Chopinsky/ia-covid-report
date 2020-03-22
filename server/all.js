"use restrict";

const axios = require("axios");
const fs = require("fs");
const path = require("path");

const url =
  "https://us-central1-covid-19-live.cloudfunctions.net/datajsonShort";

const dir = "../data/history";
const iaDir = "../data/summary"

exports.fetchAll = function(date) {
  console.log('fetching overall data for:', date, '...');
  
  axios.get(url).then(({ data }) => {
    const arr = data.data.data;
    const timestamp = data.data.generationTime;

    if (!arr || !arr.length) {
      console.log(data.data.data);
      return;
    }

    const today = new Date(date);
    const todayString =
      (today.getMonth() + 1).toString() + "/" + today.getDate();

    let daily;
    let iowa = {};
    let iowaDaily;

    for (let i = 0; i < arr.length; i++) {
      const county = arr[i];
      const day = county["confirmed_date"];

      if (!day) {
        console.log("broken data: ", county);
        continue;
      }

      if (!daily || day !== daily["date"]) {
        if (daily) {
          let thatDate = daily["date"].replace("/", "-").replace("/", "-");
          const location = path.resolve(__dirname, dir, thatDate + "-20.json");

          fs.writeFile(location, JSON.stringify(daily), () => {
            console.log("[info] done writing data for", thatDate, "at", location);
          });

          const keys = Object.keys(iowaDaily);

          for (let j = 0; j < keys.length; j++) {
            const iaCounty = keys[j];

            if (!iowa.hasOwnProperty(iaCounty)) {
              iowa[iaCounty] = [];
            }

            iowa[iaCounty].push({
              date: daily["date"] + "/20",
              count: iowaDaily[iaCounty]
            });
          }
        }

        daily = {
          date: day,
          counties: {}
        };

        iowaDaily = {};
      }

      const key = county["state_name"] + "-" + county["county"];

      if (daily.counties.hasOwnProperty(key)) {
        daily.counties[key] += county["people_count"];
      } else {
        daily.counties[key] = county["people_count"];
      }

      if (county["state_name"] === "IA") {
        iowaDaily[county["county"]] = daily.counties[key];
      }
    }

    const location = path.resolve(__dirname, iaDir, date + ".json");
    fs.writeFile(location, JSON.stringify(iowa), () => {
      console.log("[info] done writing iowa data at", location);
    });
  });
};
