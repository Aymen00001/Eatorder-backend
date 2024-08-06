const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: false,
  },
  description: {
    type: String,
    required: false,
  },
  availability:{
    type:Boolean,
    default:true
  },
  availabilitys:[ {
    availability:{
    type:Boolean,
  },
    mode: {
      type: mongoose.Schema.Types.ObjectId,

      ref: 'ConsumationMode',
      required: true,
    },
}],
  parentId: {
    type: String,
    required: false,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
  },
  status: {
    type: String,
    enum: ['active', 'pending'],
    default: 'pending',
  },
  image: {
    type: String,
    default: 'images/default.png',
  },
  products: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  }],
  subcategories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
  }],
});

const Category = mongoose.model('Category', categorySchema);
module.exports = Category;

