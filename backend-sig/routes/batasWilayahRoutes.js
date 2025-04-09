const express = require('express');
const BatasWilayah = require('../models/BatasWilayah');
const router = express.Router();

// Mengambil semua data batas wilayah
router.get("/", async (req, res) => {
    try {
        const wilayah = await BatasWilayah.find();
        res.json(wilayah);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;