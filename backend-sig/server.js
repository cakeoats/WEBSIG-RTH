const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const fs = require("fs");
require("dotenv").config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Koneksi ke MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected ✅"))
    .catch(err => console.log("MongoDB Connection Error ❌", err));

// Routes
app.get("/", (req, res) => {
    res.send("API SIG Berjalan 🚀");
});

// Menambahkan routing untuk upload GeoJSON
const uploadGeojsonRoutes = require("./routes/uploadGeojsonRoutes");
app.use("/api/upload-geojson", uploadGeojsonRoutes);

// Menambahkan routing untuk batas wilayah
const batasWilayahRoutes = require("./routes/batasWilayahRoutes");
app.use("/api/batas-wilayah", batasWilayahRoutes);

// Menjalankan server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server berjalan di port ${PORT}`));
