const mongoose = require('mongoose');

const deliveryStatusSchema = new mongoose.Schema({
  account_id: String,
  batch_id: String,
  created: Date,
  customer_id: String,
  data: {
    batch_id: String,
    complete: Boolean,
    courier: {
      img_href: String,
      location: {
        lat: Number,
        lng: Number
      },
      name: String,
      phone_number: String,
      rating: String,
      vehicle_color: String,
      vehicle_make: String,
      vehicle_model: String,
      vehicle_type: String
    },
    courier_imminent: Boolean,
    created: Date,
    currency: String,
    deliverable_action: String,
    dropoff: {
      address: String,
      detailed_address: {
        street_address_1: String,
        street_address_2: String,
        city: String,
        state: String,
        zip_code: String,
        country: String
      },
      location: {
        lat: Number,
        lng: Number
      },
      name: String,
      notes: String,
      phone_number: String,
      status: String,
      status_timestamp: Date,
      verification: {
        barcodes: [{
          scan_result: {
            outcome: String,
            timestamp: Date
          },
          type: String,
          value: String
        }],
        picture: {
          image_url: String
        },
        pin_code: {
          entered: String
        },
        signature: {
          image_url: String,
          signer_name: String,
          signer_relationship: String
        }
      },
      verification_requirements: {
        barcodes: [{
          type: String,
          value: String
        }],
        picture: Boolean,
        pincode: {
          enabled: Boolean,
          value: String
        },
        signature: Boolean,
        signatureRequirement: {
          collect_signer_name: Boolean,
          collect_signer_relationship: Boolean,
          enabled: Boolean
        }
      }
    },
    dropoff_deadline: Date,
    dropoff_eta: Date,
    dropoff_ready: Date,
    external_id: String,
    fee: Number,
    id: String,
    kind: String,
    live_mode: Boolean,
    manifest: {
      description: String,
      total_value: Number
    },
    manifest_items: [{
      dimensions: {
        depth: Number,
        height: Number,
        length: Number
      },
      must_be_upright: Boolean,
      name: String,
      price: Number,
      quantity: Number,
      size: String
    }],
    pickup: {
      address: String,
      detailed_address: {
        street_address_1: String,
        street_address_2: String,
        city: String,
        state: String,
        zip_code: String,
        country: String
      },
      location: {
        lat: Number,
        lng: Number
      },
      name: String,
      notes: String,
      phone_number: String,
      status: String,
      status_timestamp: Date
    },
    pickup_action: String,
    pickup_deadline: Date,
    pickup_eta: Date,
    pickup_ready: Date,
    quote_id: String,
    route_id: String,
    status: String,
    tracking_url: String,
    undeliverable_action: String,
    undeliverable_reason: String,
    updated: Date,
    uuid: String
  },
  delivery_id: String,
  developer_id: String,
  id: String,
  kind: String,
  live_mode: Boolean,
  route_id: String,
  status: String
});

const DeliveryStatus = mongoose.model('DeliveryStatus', deliveryStatusSchema);

module.exports = DeliveryStatus;
