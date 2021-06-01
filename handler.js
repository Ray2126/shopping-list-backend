const express = require("express");
const serverless = require("serverless-http");
const items = require('./src/routes/items');

const app = express();
app.use(express.json());

app.use('/api', items);

app.use((req, res, next) => {
  return res.status(404).json({
    error: "Not Found",
  });
});


module.exports.handler = serverless(app);
