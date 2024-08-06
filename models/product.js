const mongoose = require('mongoose');
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
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
  storeId:{
    type:mongoose.Schema.Types.ObjectId,
    required: false,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: false,
  },
  price:{
    type:Number,
  },
  image: {
    type: String,
    default: 'images/default.png',
  },
  size :[{
    name:{
        type:String,
    },
    price:{
      type:Number,
    },
    optionGroups: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'OptionGroup',
      required: false,
      //select: false,
    }],
  }],
  optionGroups: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'OptionGroup',
    required: false,
  }],
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
  tags: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tags',
}],
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;