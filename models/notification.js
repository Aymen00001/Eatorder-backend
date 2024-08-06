const mongoose = require('mongoose');


const notificationSchema = new mongoose.Schema({
    clientId: { 
        type: String 
    },
    idFront: {
        type: String,
    },
    orderid: {
        type: String,
    },
    message: {
        type: String,
    },
    read: {
        type: Boolean,
    },
    date: {
        type: Date,
    },
    dateRead: { 
        type: Date,
    },
    readAll: {
        type: Boolean,
    },
});

module.exports = mongoose.model('notification', notificationSchema);
