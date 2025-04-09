const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const BatasWilayah = require("../models/BatasWilayah");

const router = express.Router();

// Konfigurasi multer untuk upload file
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = "uploads/"; // Folder untuk upload
        console.log("Folder upload:", uploadPath); // Verifikasi folder yang digunakan
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath); // Membuat folder uploads jika belum ada
            console.log("Folder uploads dibuat!"); // Debugging: Folder dibuat
        }
        cb(null, uploadPath); // Simpan file ke folder "uploads"
    },
    filename: (req, file, cb) => {
        // Validasi apakah file yang diupload adalah GeoJSON
        const ext = path.extname(file.originalname).toLowerCase();
        if (ext !== ".geojson") {
            return cb(new Error("Hanya file dengan ekstensi .geojson yang diizinkan"));
        }
        cb(null, file.originalname); // Gunakan nama asli file
    }
});
const upload = multer({ storage: storage });


// Endpoint untuk upload file GeoJSON
router.post("/", upload.single("geojson"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "File tidak ditemukan!" });
        }

        const filePath = `uploads/${req.file.filename}`;
        const rawData = fs.readFileSync(filePath, "utf8");
        const geojsonData = JSON.parse(rawData); // Konversi dari string ke JSON object

        // Log GeoJSON data untuk debugging
        console.log("GeoJSON data yang diterima:", geojsonData);

        // Periksa apakah GeoJSON valid
        if (!geojsonData.features || !Array.isArray(geojsonData.features)) {
            return res.status(400).json({ message: "Format GeoJSON tidak valid!" });
        }

        // Simpan setiap fitur ke MongoDB
        const savedData = await Promise.all(
            geojsonData.features.map(async (feature) => {
                // Validasi apakah feature.geometry ada
                if (!feature.geometry || !feature.geometry.coordinates) {
                    console.log(`Feature geometry invalid, skipping: ${feature.properties.name || "Unnamed"}`);
                    return null; // Lewati jika geometry invalid
                }

                const existingWilayah = await BatasWilayah.findOne({
                    name: feature.properties.district || feature.properties.village || "Unnamed"
                });

                if (!existingWilayah) {
                    const newWilayah = new BatasWilayah({
                        name: feature.properties.district || feature.properties.village || "Unnamed",
                        geometry: feature.geometry
                    });
                    return await newWilayah.save(); // Simpan ke database
                } else {
                    console.log(`Data ${existingWilayah.name} sudah ada, tidak disimpan ulang.`);
                    return null;
                }
            })
        );

        // Hanya kirimkan data yang berhasil disimpan
        res.status(201).json({ message: "Data berhasil disimpan!", data: savedData.filter(item => item !== null) });

    } catch (err) {
        console.error("Terjadi kesalahan!", err);
        res.status(500).json({ message: "Terjadi kesalahan!", error: err.message });
    }
});

module.exports = router;
