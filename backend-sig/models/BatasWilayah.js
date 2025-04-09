const mongoose = require("mongoose");

const BatasWilayahSchema = new mongoose.Schema({
    name: { type: String, required: true },
    geometry: {
        type: { type: String, enum: ["Polygon", "MultiPolygon"], required: true },
        coordinates: { type: mongoose.Schema.Types.Mixed, required: true } // Menggunakan Mixed agar lebih fleksibel
    }
});

module.exports = mongoose.model("BatasWilayah", BatasWilayahSchema);
