const express = require('express');
const router = express.Router();
const Api = require('../models/api');

// get data from api
router.get('/', async (req, res) => {
    try {
        const latest_data = await Api.findOne({}, {}, {sort: {'createdAt': 1}});
        res.json(latest_data);
    } catch {
        res.status(500).json({message: err.message });
    }
});

module.exports = router;