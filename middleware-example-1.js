const express = require("express");
// @ts-ignore
const bodyParser = require("body-parser");
const app = express();

// @ts-ignore
app.use((req, res, next) => {
  // @ts-ignore
  req.date = new Date();
  next();
});

app.get("/", (req, res) => {
  // @ts-ignore
  console.log(req.date);
  // @ts-ignore
  res.send(`hello ${req.date}`);
});

app.listen(8080, function() {
  console.log("Listening on port 8080!");
});
