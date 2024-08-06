const mongoose = require('mongoose');
// Définition du schéma pour les devis de livraison
const deliveryQuoteSchema = new mongoose.Schema({
  kind:  {
    type: String,
  },
  id:  {
    type: String,
  },
  created: {
    type: Date,
  },
  expires: {
    type: Date,
  },
  fee: {
    type: Number,
  },
  currency:{
    type: String,
  },
  currency_type: {
    type: String,
  },
  dropoff_eta:{
    type: Date,
  },
  duration:{
    type: Number,
  },
  pickup_duration: {
    type: Number,
  },
  dropoff_deadline: {
    type: Date,
  },
  orderID:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
  }
});
// Modèle pour les devis de livraison
const DeliveryQuote = mongoose.model('DeliveryQuote', deliveryQuoteSchema);
module.exports = DeliveryQuote;