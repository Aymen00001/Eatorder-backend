const mongoose = require('mongoose');
const guestSchema = new mongoose.Schema({
    firstName: {
        type: String
    },
    lastName: {
        type: String,
        },
        phoneNumber: {
        type: String,
    },
    email:{
        type:String,
    },
    address:{
        type:String,
    },
    verificationCode: {
        type: String,
    },
 
 
});
module.exports = mongoose.model('guest', guestSchema);