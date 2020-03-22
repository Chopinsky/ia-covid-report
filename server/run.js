'use restrict';

const commands = process.argv.slice(2);
if (!commands) {
  console.info("[warning] nothing to execute, exiting ... ");
  return;
}

const { fetch } = require("./crawler");
const { fetchAll } = require("./all");
const command = commands[0];

const dateTime = new Date().toISOString().split("T");
const date = dateTime[0];

switch (command) {
  case "update":
    console.log(`ready to update numbers for ${date}... `);
    fetch(date);
    break;

  case "dailyAll":
    console.log(`ready to get all data for ${date}... `);
    fetchAll(date);
    break;

  default:
    break;
}
