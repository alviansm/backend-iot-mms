const express = require('express');
const router = express.Router();
const Api = require('../models/api');
const mqtt = require('mqtt');
const timeout = require('express-timeout-handler');

/**
 * @swagger
 * components:
 *   schemas:
 *     Api:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: ID secara otomatis di-generate oleh server
 *         time_day:
 *           type: string
 *           description: Hari data di-log
 *         time_date:
 *           type: string
 *           description: Tanggal data di-log
 *         time_clock:
 *           type: string
 *           description: Pukul data
 *         sense_t1:
 *           type: string
 *           description: Pembacaan sensor temperatur 1
 *         sense_t2:
 *           type: string
 *           description: Pembacaan sensor temperatur 2
 *         sense_t3:
 *           type: string
 *           description: Pembacaan sensor temperatur 3
 *         sense_t4:
 *           type: string
 *           description: Pembacaan sensor temperatur 4
 *         sense_t5:
 *           type: string
 *           description: Pembacaan sensor temperatur 5
 *         sense_t6:
 *           type: string
 *           description: Pembacaan sensor temperatur 6
 *         sense_t7:
 *           type: string
 *           description: Pembacaan sensor temperatur 7
 *         sense_t8:
 *           type: string
 *           description: Pembacaan sensor temperatur 8
 *         sense_th1:
 *           type: string
 *           description: Pembacaan sensor temperatur DHT21
 *         sense_rh:
 *           type: string
 *           description: Pembacaan sensor kelembapan DHT21
 *         sense_current1:
 *           type: string
 *           description: Pembacaan sensor arus - Kipas Evap
 *         sense_current2:
 *           type: string
 *           description: Pembacaan sensor arus - Kompresor & Kipas Kondensor
 *         cop:
 *           type: string
 *           description: COP sistem pendingin
 *         power:
 *           type: string
 *           description: Pembacaan sensor arus - Kompresor & Kipas Kondensor
 *         uptime:
 *           type: string
 *           description: Pembacaan sensor arus - Kompresor & Kipas Kondensor
 *         charge_time:
 *           type: string
 *         charging:
 *           type: string
 *           description: Pembacaan sensor arus - Kompresor & Kipas Kondensor
 *         createdAt:
 *           type: string
 *           format: date
 *           description: Waktu data ditambahkan ke database
 */

/**
 * @swagger
 * tags:
 *   name: API
 *   description: REST API untuk interaksi server dan database
 * /api:
 *   get:
 *     summary: Mendapatkan data terbaru dari database
 *     tags: [API]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Api'
 *     responses:
 *       200:
 *         description: Berhasil mendapatkan data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Api'
 *       500:
 *         description: Server Error
 * /api/switch-compressor:
 *   post:
 *     summary: Perintah switch kompresor ke MQTT
 *     tags: [API]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Api'
 *     responses:
 *       200:
 *         description: Berhasil mendapatkan data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Api'
 *       500:
 *         description: Server Error
 * 
 * /api/switch-evap-fan:
 *   post:
 *     summary: Perintah switch fan evap ke MQTT
 *     tags: [API]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Api'
 *     responses:
 *       200:
 *         description: Berhasil mendapatkan data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Api'
 *       500:
 *         description: Server Error
 * 
 * /api/switch-eco:
 *   post:
 *     summary: Perintah switch mode eco ke MQTT
 *     tags: [API]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Api'
 *     responses:
 *       200:
 *         description: Berhasil mendapatkan data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Api'
 *       500:
 *         description: Server Error
 * 
 * /api/change-setpoint:
 *   post:
 *     summary: Perintah mengubah set point ke MQTT
 *     tags: [API]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Api'
 *     responses:
 *       200:
 *         description: Berhasil mendapatkan data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Api'
 *       500:
 *         description: Server Error
 * 
 * /api/remove-all-data:
 *   delete:
 *     summary: Perintah menghapus database MongoDB Atlas
 *     tags: [API]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Api'
 *     responses:
 *       200:
 *         description: Berhasil mendapatkan data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Api'
 *       500:
 *         description: Server Error
 *
 */
router.get('/', async (req, res) => {
    try {
        const latest_data = await Api.findOne({}, {}, {sort: {'createdAt': -1}});
        res.status(200).json(latest_data);
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
            res.status(200).json({msg: "Publish: Switch kompresor berhasil"});
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
            res.status(200).json({msg: "Publish: Switch evaporator fan berhasil"});
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
            res.status(200).json({msg: message});
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