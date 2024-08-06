const mongoose = require('mongoose');

const menuSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    store: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Store',
        required: false,
    },
    currency: {
        type: String,
        required:false,

    },
    description: {
        type: String,
        required: false,
    },
    categorys: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
    }],


});

const Menu = mongoose.model('Menu', menuSchema);
module.exports = Menu;
