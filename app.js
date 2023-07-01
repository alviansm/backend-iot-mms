require('dotenv').config();

var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var mqtt = require('mqtt');
var app = express();
var cors = require('cors');

//
app.use(cors());

// database connect
mongoose.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true
});
const db = mongoose.connection;
db.on('error', (error) => console.log("Koneksi ke database gagal"));
db.once('open', () => console.log("Berhasil terkoneksikan ke database"));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// ROUTES
const apiRouter = require('./routes/api');
app.use('/api', apiRouter);

// SEND DATA FROM MQTT BROKER TO DATABASE
const Api = require('./models/api');
async function query_to_mongodb() {
    const message_to_query = new Api({
        id: "esp32/ecoreefermms-topic",
        time_day: array_message[0],
        time_date: array_message[1],
        time_clock: array_message[2],
        sense_t1: array_message[3],
        sense_t2: array_message[4],
        sense_t3: array_message[5],
        sense_t4: array_message[6],
        sense_t5: array_message[7],
        sense_t6: array_message[8],
        sense_t7: array_message[9],
        sense_t8: array_message[10],
        sense_th1: array_message[11],
        sense_rh: array_message[12],
        sense_current1: array_message[13],
        sense_current2: array_message[14],
        cop: array_message[15],
        power: array_message[16],
        uptime: array_message[17],
        charge_time: array_message[18],
        charging: array_message[19]
    });
    try {
        const new_query_to_database = await message_to_query.save();
        console.log("Berhasil query message ke database");
    } catch {
        console.log("Gagal menyimpan message ke database");
    }
}

const client = mqtt.connect('mqtt://test.mosquitto.org');
const message = "";
const topic = "esp32/ecoreefermms-topic";

// MQTT connection setting
client.on('connect', () => {    
    if (client.connected === true) {                
        console.log(`Berhasil mengkoneksikan ke broker Mosquitto MQTT`);
    }
    client.subscribe(topic);
});
// Receive a message from subscribed topic
var array_message = [];
client.on('message', (topic, message) => {
    const temp_message = String(message);
    array_message = temp_message.split(",");
    console.log(`message: ${array_message}`);
    query_to_mongodb();
});

module.exports = app;