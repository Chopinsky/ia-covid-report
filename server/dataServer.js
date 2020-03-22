const express = require("express");
const app = express();
const port = process.env.PORT || 8080;

// respond with "hello world" when a GET request is made to the homepage
app.get("/cases/today", function(_req, res) {
  res.send("hello world");
});

app.get("/cases/:date", function(_req, res) {
  res.send("data unavailable ... ");
});

app.listen(port, () => console.log(`server is listening on port ${port}!`));
