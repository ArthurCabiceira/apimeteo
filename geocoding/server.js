const express = require("express");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 4002;
const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";

app.get("/geocoding", async (req, res) => {
  const name = typeof req.query.name === "string" ? req.query.name.trim() : "";
  if (!name) {
    return res.status(400).json({ error: "A city name is required" });
  }

  try {
    const response = await axios.get(GEOCODING_URL, {
      params: {
        name,
        count: 1,
        language: "pt",
        format: "json",
      },
      timeout: 10000,
    });
    return res.json(response.data.results ?? []);
  } catch (error) {
    console.error("Geocoding provider request failed:", error.message);
    if (error.response) {
      return res.status(502).json({
        error: `Geocoding provider returned HTTP ${error.response.status}`,
      });
    }
    return res.status(503).json({
      error: "Geocoding provider is unavailable. Try again later.",
    });
  }
});

app.listen(PORT, () => {
  console.log(`[Geocoding] Active on port ${PORT}`);
});
