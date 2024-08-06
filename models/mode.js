const mongoose = require('mongoose');

const consumationModeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
  frais: {
    type: Number,
    required: true,
  },
  taux: {
    type: Number,
    required: true,
  },
  applyTaux: {
    type: Boolean,
    required: true,
  },
  applicationType: {
    type: String,
    enum: ['product', 'order'],  // Les valeurs possibles pour le type d'application
    required: true,
  },
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',  // Assurez-vous que le nom du modèle de magasin est correct ici
    required: true,
  },
  reduction: {
    type: Number, // You can adjust the type of "reduction" as needed (e.g., Number, String, etc.)
    required: true,
  },
  minOrder: {
    type: Number,
    required: false,
  },
});

const ConsumationMode = mongoose.model('ConsumationMode', consumationModeSchema);

module.exports = ConsumationMode;