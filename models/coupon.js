const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    code: { type: String, unique: true },
    discount: { type: Number, required: true },
  storeId:{type:mongoose.Schema.Types.ObjectId,required: true
  },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
  numberOfUses: { type: Number, default: 0 },
});

const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = Coupon;
