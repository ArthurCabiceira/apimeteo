const url = "https://api.open-meteo.com/v1/forecast";
const express = require("express");
const app = express();
const axios = require("axios");

app.get("/forecast", async (req, res) => {
  const latitude = Number(req.query.latitude);
  const longitude = Number(req.query.longitude);
  if (!req.query.latitude || !req.query.longitude ||
      !Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return res.status(400).json({ error: "Latitude and longitude are required" });
  }
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return res.status(400).json({ error: "Latitude or longitude is out of range" });
  }

  try {
    const response = await axios.get(url, {
      params: {
        latitude,
        longitude,
        current: "temperature_2m,wind_speed_10m",
      },
    });
    return res.json(response.data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch forecast data" });
  }
});

const PORT = process.env.PORT || 4001;
app.listen(PORT, () => {
  console.log(`[Forecast] Active on port ${PORT}`);
});
