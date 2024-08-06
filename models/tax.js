const mongoose = require('mongoose');

const taxSchema = new mongoose.Schema({
  name: { type: String, required: true },
  rate: { type: Number, required: true },
  storeId:{
    type:mongoose.Schema.Types.ObjectId,
    required: false,
  },
});

const Tax = mongoose.model('Tax', taxSchema);

module.exports = Tax;
