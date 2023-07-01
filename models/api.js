const mongoose = require('mongoose');

const apiSchema = new mongoose.Schema({
    id: {
        type: String,
    },
    time_day: {
        type: String,
    },
    time_date: {
        type: String,
    },
    time_clock: {
        type: String,
    },
    sense_t1: {
        type: String,
    },
    sense_t2: {
        type: String,
    },
    sense_t3: {
        type: String,
    },
    sense_t4: {
        type: String,
    },
    sense_t5: {
        type: String,
    },
    sense_t6: {
        type: String,
    },
    sense_t7: {
        type: String,
    },
    sense_t8: {
        type: String,
    },
    sense_th1: {
        type: String,
    },
    sense_rh: {
        type: String,
    },
    sense_current1: {
        type: String,
    },
    sense_current2: {
        type: String,
    },
    cop: {
        type: String,
    },
    power: {
        type: String,
    },
    uptime: {
        type: String,
    },
    charge_time: {
        type: String,
    },
    charging: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Api', apiSchema);