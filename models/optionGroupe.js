const mongoose = require('mongoose');
const optionGroupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',  // Assurez-vous que le nom du modèle de magasin est correct ici
    required: false,
  },
  force_max: {
    type: String,
    required: false,
  },
  force_min: {
    type: String,
    required: false,
  },
  allow_quantity: {
    type: Boolean,
    required: false,
  },
  options: [{
    option: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProductOption',
    },
    price: {
      type: Number,
      required: false,
    },
    name: {
      type: String,
      required: false,
    },
    tax: {
      type: Number,
      required: false,
    },
    taxes: [
      {
        tax: { type: mongoose.Schema.Types.ObjectId, ref: 'Tax' },
        mode: { type: mongoose.Schema.Types.ObjectId, ref: 'ConsumationMode' }
      }
    ],
    unite: {
      type: String,
      required: false,
    },
    promoPercentage: {
      type: Number,
      default: 0,
      required: false,
    },
    image: {
      type: String,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    subOptionGroup: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'OptionGroup',
      required: false,
  }],
  }],
  image: {
    type: String,
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },

  taxes: [{
    tax:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tax',
    required: false,
     } ,
    mode: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ConsumationMode',
      required: false,
    },
  }],
  
});
module.exports = mongoose.model('OptionGroup', optionGroupSchema);
