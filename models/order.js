const mongoose = require("mongoose");
const orderSchema = new mongoose.Schema({
  uberId: {
    type: String,
    default: null
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  client_first_name: {
    type: String,
    require: true,
  },
  client_last_name: {
    type: String,
    require: true,
  },
  client_email: {
    type: String,
    require: true,
  },
  client_phone: {
    type: String,
    require: true,
  },
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Store",
    require: true,
  },
  currency: {
    type: String,
    require: true,
  },
  type: {
    type: String,
    require: true,
  },
  status: {
    type: String,
    default: "pending",
  },
  source: {
    type: String,
    default: "Web",
  },
  price_total: {
    type: Number,
    require: true,
  },
  priceHt_total: {
    type: Number,
    require: true,
  },
  priceWithoutFee: {
    type: Number,
    require: true,
  },
  deliveryAdress: {
    type: String,
  },
  restaurantAdress: {
    type: String,
  },
  restaurant_phone: {
    type: String,
    require: true,
  },
  table: {
    type: Number,
    default: 0,
  },
  size: {
    type: String,
    default: "S",
  },
  paymentMethod: {
    type: String,
    require: true,
  },
  refundId: {
    type: String,
    require: true,
  },
  paymentStatus: {
    type: String,
    default: "pending",
    enum: ['paid', 'pending']
  },
  notes: {
    type: String,
  },
  promo: [
    {
      promoId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Promo",
      },
      items: [
        {
          id: String,
          name: String,
          description: String,
          price_after_discount: Number,
          item_price: Number,
          subtotal: Number,
          quantity: Number,
          size: String,
          note: String,
          image : String,
          price: Number,
          priceHt: Number,
             tax: [
            // {
            //   tax: {
            //     name: String,
            //     rate: Number,
            //     storeId: {
            //       type: mongoose.Schema.Types.ObjectId,
            //       ref: "Store",
            //     }
            //   },
            //   mode: String,
            //   // type: mongoose.Schema.Types.ObjectId,
            //   // ref: "Tax",
            // },
            {
              id: String,
              type : Object
            }
          ],
          options: [
            {
              id: String,
              name: String,
              optionGroupeId: String,
              optionGroupeName: String,
              price_opt: Number,
              group_name: String,
              quantity: Number,
              tax : Number,
              options: [{
                id: String,
                name: String,
                price: Number,
                quantity: Number,
                tax: Number,
              }],
            },
          ],
        },
      ],
    },
  ],
  items: [
    {
      id: String,
      name: String,
      description: String,
      item_price: Number,
      price: Number,
      priceHt: Number,
      quantity: Number,
      size: String,
      note: String,
      image : String,
       tax: [
            // {
            //   tax: {
            //     name: String,
            //     rate: Number,
            //     storeId: {
            //       type: mongoose.Schema.Types.ObjectId,
            //       ref: "Store",
            //     }
            //   },
            //   mode: String,
            //   // type: mongoose.Schema.Types.ObjectId,
            //   // ref: "Tax",
            // },
            {
              id: String,
              type : Object
            }
          ],
       taxId: [
            {
              id: String,
              type : Object
            }
          ],
      options: [
        {
          id: String,
          name: String,
          optionGroupeId: String,
          optionGroupeName: String,
          price_opt: Number,
          group_name: String,
          quantity: Number,
          tax : Number,
          options: [{
            id: String,
            name: String,
            price: Number,
            quantity: Number,
            tax: Number,
          }],
        },
      ],
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
  },
  fulfillmentAt: {
    type: Date,
  },
  preparedAt: {
    type: Date,
  },
  deliveryInformation : {
      type : Object
  },
    updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }
});
module.exports = mongoose.model("Order", orderSchema);