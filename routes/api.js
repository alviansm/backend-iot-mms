const express = require('express');
const router = express.Router();
const Api = require('../models/api');
const mqtt = require('mqtt');

// get latest data from database
router.get('/', async (req, res) => {
    try {
        const latest_data = await Api.findOne({}, {}, {sort: {'createdAt': -1}});
        res.json(latest_data);
    } catch {
        res.status(500).json({msg: "Gagal mendapatkana data"});
    }
});

// api to switch compressor
router.post('/switch-compressor', async (req, res) => {
    const client = mqtt.connect('mqtt://test.mosquitto.org');
    const message = "Status: Kompresor";
    const topic = "esp32/ecoreefermms-topic-status";

    try {
        client.on('connect', () => {
            if (client.connected === true ) {
                console.log("Koneksi ke MQTT berhasil - Publish");
            }
            client.publish(topic, message);
            res.json({msg: "Publish: Switch kompresor berhasil"});
        });
    } catch {
        res.status(500).json({msg: "Gagal melakukan switch kompresor"});
    }
});

// api to switch evaporator fan 
router.post('/switch-evap-fan', async (req, res) => {
    const client = mqtt.connect('mqtt://test.mosquitto.org');
    const message = "Status: Evap Fan";
    const topic = "esp32/ecoreefermms-topic-status";

    try {
        client.on('connect', () => {
            if (client.connected === true ) {
                console.log("Koneksi ke MQTT berhasil - Publish");
            }
            client.publish(topic, message);
            res.json({msg: "Publish: Switch evaporator fan berhasil"});
        });
    } catch {
        res.status(500).json({msg: "Gagal melakukan switch evaporator"});
    }
});

// api to switch eco mode
router.post('/switch-eco', async (req, res) => {
    const client = mqtt.connect('mqtt://test.mosquitto.org');
    const message = "Publish: Swithc mode eco berhasil";
    const topic = "esp32/ecoreefermms-topic-status";

    try {
        client.on('connect', () => {
            if (client.connected === true ) {
                console.log("Koneksi ke MQTT berhasil - Publish");
            }
            client.publish(topic, "Status: Eco");
            res.json({msg: message});
        });
    } catch {
        res.status(500).json({msg: "Gagal melakukan switch"});
    }
});

// api to submit the set point
router.post('/change-setpoint', async (req, res) => {
    const client = mqtt.connect('mqtt://test.mosquitto.org');
    const message = "";
    const topic = "esp32/ecoreefermms-topic-status";
    const data = req.body;

    try {
        client.on('connect', () => {
            if (client.connected === true ) {
                console.log("Koneksi ke MQTT berhasil - Publish");
            }
            console.log(data);
            client.publish(topic, "Status: Set Point");
            client.publish(topic, String(data.setpoint));
            res.status(200).json({msg: "Publish mengubah set point menjadi x"});
        });
    } catch {
        res.status(500).json({msg: "Gagal mengubah set point"});
    }
});

// api to delete all data from database
router.delete('/remove-all-data', async (req, res) => {
    try {
        const api_data = await Api.deleteMany({});
        res.json({message: "all data removed"});
    } catch {
        res.status(500).json({message: err.message});
    }
});

module.exports = router;