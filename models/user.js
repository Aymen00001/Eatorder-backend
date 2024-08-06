const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  email: {
    type: String,
    required: false,
    unique: true,
  },
  password: {
    type: String,
    required: false,
  },
  phoneNumber: {
    type: String,
    required: false,
  },
  role: {
    type: String,
    enum: ['client', 'owner', 'manager', 'admin', 'caissier'],
    required: true,
  },
  sexe: {
    type: String,

  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['active', 'suspended', 'pending'],
    default: 'pending',
  },
  verifid: {
    type: Boolean,
    default: 'false',
  },
  image: {
    type: String,
    default: 'images/default.png',
  },
  stores: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
  }],
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
  },
  deliveryAdress: [
    {
      Nameaddress: String,
      Type: String,
      Lat: Number,
      Lon: Number,
      Note: String,
    }
  ],
});

module.exports = mongoose.model('User', userSchema);
