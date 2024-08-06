const mongoose = require('mongoose');
const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  owners: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  stores:[{
    type: mongoose.Schema.Types.ObjectId,
    ref:'Store'
  }],
      uberOrganizationId: {
        type: String,
      },
  verified: {
    type: Boolean,
    default: 'false',
  },
  legalstatus: {
    type: String,
    default: "pending",
  },
  duns: {
    type: String,
  //  required: true,
  },
      address: 
          {
          street: {
    type: String,
        },
        city: {
            type: String,
        },
        state: {
            type: String,
        },
        zipcode: {
            type: String,
  },
        country_iso2: {
            type: String,
        }
            },
    phone_details: {
          phone_number: {
              type: String,
          },
          country_code: {
              type: String,
          },
          subscriber_number: {
              type: String,
          }
  },
  email: {
    type: String,
  },
  website: {
    type: String,
  },
  CompanyLogo: {
    type: String,
    default: 'images/default.png',
  },
      CompanyBanner: {
        type: String,
        default: 'images/default.png',
      },
      stripeAccountId:{
        type: String,
      }

});

module.exports = mongoose.model('Company', companySchema);
