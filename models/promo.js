const mongoose = require('mongoose');
const promoSchema = new mongoose.Schema({
  name: {
    type: String,
    // required: true,
  },
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store'
  },
  numberGroup: {
    type: Number,
    //required: true,
  },
  number2: {
    type: Number,
    //  required: true,
  },
  image: {
    type: String,
    default: 'images/default.png',
  },
  promos: [{
    products: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    }],
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: false,
    },
    order: {
      type: Number,
      // required: true,
    },
  }],
  discount: {
    type: Number,
    //  required: true,
  }, availability: {
    type: Boolean,
    default: true,
  },
  availabilitys: [
    {
      availability: {
        type: Boolean,
        default: true,
      },
      mode: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ConsommationMode'
      }
    }
  ]
});
module.exports = mongoose.model('Promo', promoSchema);











