require('dotenv').config();
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var mqtt = require('mqtt');
var app = express();
var cors = require('cors');
var bodyParser = require('body-parser');
var timeout = require('express-timeout-handler');
var swaggerJsdoc = require("swagger-jsdoc");
var swaggerUi = require("swagger-ui-express");
const { MongoClient, ServerApiVersion } = require('mongodb');

// database connect
app.use(cors());
mongoose.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', (error) => console.log("Koneksi ke database gagal"));
db.once('open', () => console.log("Berhasil terkoneksikan ke database"));

var options_timeout = {

    timeout: 150000, // 2.5 minute limit timeout
  
    onTimeout: function(req, res) {
      res.status(503).send('Service unavailable. Please retry.');
    },
  
    // Optional. Define a function to be called if an attempt to send a response
    // happens after the timeout where:
    // - method: is the method that was called on the response object
    // - args: are the arguments passed to the method
    // - requestTime: is the duration of the request
    // timeout happened
    onDelayedResponse: function(req, method, args, requestTime) {
      console.log(`Attempted to call ${method} after timeout`);
    },
  
    // Optional. Provide a list of which methods should be disabled on the
    // response object when a timeout happens and an error has been sent. If
    // omitted, a default list of all methods that tries to send a response
    // will be disable on the response object
    disable: ['write', 'setHeaders', 'send', 'json', 'end']
};

const options_docs = {
    definition: {
      openapi: "3.1.0",
      info: {
        title: "IoT Based EMS",
        version: "1.0.0",
        description:
          "REST API untuk Sistem Manajemen Energi Berbasis IoT pada Kontainer Berpendingin",
        license: {
          name: "MIT",
          url: "https://spdx.org/licenses/MIT.html",
        },
        contact: {
          name: "AlviansMaulana",
          email: "alviansmaulana@email.com",
        },
      },
      servers: [
        {
          url: process.env.HOST_URL,
        },
      ],
    },
    apis: ["./routes/*.js"],
};
  
const specs = swaggerJsdoc(options_docs);
app.use(
"/api-docs",
swaggerUi.serve,
swaggerUi.setup(specs)
);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(timeout.handler(options_timeout));

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
        if (array_message[0].length > 0) {
            const new_query_to_database = await message_to_query.save();
            console.log("Berhasil query message ke database");
        } else {
            console.log("Tidak ada message untuk diquery");
        }
        
    } catch {
        console.log("Gagal menyimpan message ke database");
    }
}

const client = mqtt.connect('mqtt://test.mosquitto.org');
const message = "";
const topic = "esp32/ecoreefermms-topic";

// MQTT connection setting
client.on('connect', () => {    
    try {
        if (client.connected === true) {                
            console.log(`Berhasil mengkoneksikan ke broker Mosquitto MQTT`);
        }
        client.subscribe(topic);
    } catch {
        console.log("Error saat mengkoneksikan ke MQTT")
    }
});
// Receive a message from subscribed topic
var array_message = [];
client.on('message', (topic, message) => {
    try {
        const temp_message = String(message);
        array_message = temp_message.split(",");
        console.log(`message: ${array_message}`);
        query_to_mongodb();
    } catch {
        console.log("Error query to database")
    }
});

module.exports = app;