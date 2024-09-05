#!/usr/bin/env node

import ikd from "./rIKD.js";
import express from "express";
const app = express();
const PORT = process.env.PORT || 6010;

(async () => {
  const result = await ikd.Get();
  console.log(result);
})();

app.get("/", async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  const data = await ikd.Get();
  res.json(data);
});

app.listen(PORT, console.log("Listening at " + PORT));
