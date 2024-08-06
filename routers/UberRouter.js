// uberRoute.js
const express = require('express');
const router = express.Router();
const request = require('request');
const Order = require('../models/order.js');
const DeliveryQuote = require('../models/delivery.js');

router.post('/getUberToken', (req, res) => {
  const options = {
    method: 'POST',
    url: 'https://auth.uber.com/oauth/v2/token',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    form: {
      client_id: 'Utay77Bm4It6pj4XqXBrkETdJd67SMKm',
      client_secret: 'iZZR86sv-AkVUunl7PDeEcIJMrIf64KYBi8_0CY5',
      grant_type: 'client_credentials',
      scope: 'direct.organizations eats.deliveries', 
    },
  };
  request(options, (error, response, body) => {
    if (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.json({ accessToken: JSON.parse(body).access_token });
    }
  });
});
router.post('/getUberToken2', (req, res) => {
  const options = {
    method: 'POST',
    url: 'https://auth.uber.com/oauth/v2/token',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    form: {
      client_id: 'Utay77Bm4It6pj4XqXBrkETdJd67SMKm',
      client_secret: 'iZZR86sv-AkVUunl7PDeEcIJMrIf64KYBi8_0CY5',
      grant_type: 'client_credentials',
      scope: 'direct.organizations', 
    },
  };
  request(options, (error, response, body) => {
    if (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.json({ accessToken: JSON.parse(body).access_token });
    }
  });
});

//Créer un devis
router.post('/Creer_devis/:orderID', async (req, res) => {
  try {
    const costumelID = "00e54a63-2639-406b-8995-60260a1b57d8";
    const orderId = req.params.orderID;
    const orderDetails = await Order.findById(orderId).exec();
    if (!orderDetails) {
      return res.status(404).json({ message: 'Order not found' });
    }
    const token = req.headers.authorization;
    const url = `https://api.uber.com/v1/customers/${costumelID}/delivery_quotes`;
    const requestBody = {
      pickup_address: orderDetails.restaurantAdress,
      dropoff_address: orderDetails.deliveryAdress,
      pickup_phone_number: orderDetails.client_phone,
      manifest_total_value: orderDetails.price_total * 100,
      external_store_id: orderDetails.storeId
    };
    const uberDirectResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      },
      body: JSON.stringify(requestBody)
    });
    const errorMessageMap = {
      400: 'The specified location is not in a deliverable area',
      401: 'Unauthorized',
      402: 'Customer suspended',
      403: 'Customer blocked',
      404: 'Customer not found',
      408: 'Request timeout',
      429: 'Customer limited',
      500: 'Internal server error',
      503: 'Couriers busy'
    };
    if (uberDirectResponse.ok) {
      const uberDirectData = await uberDirectResponse.json();
      res.status(201).json({ message: 'Commande created successfully', uberDirectData });
    } else {
      const errorResponse = await uberDirectResponse.json();
      res.status(uberDirectResponse.status).json({ message: 'An error occurred while creating the Commande', error: errorResponse });
    }
  } catch (error) {

    console.error(error);
    res.status(500).json({ message: error?.message });
  }
});
//Créer une diffusion
router.post('/createdelivery/:orderId', async (req, res) => {
    try {
      const costumelID = "00e54a63-2639-406b-8995-60260a1b57d8";
      const token = req.headers.authorization;
      // create uber delivery
      const url = `https://api.uber.com/v1/customers/${costumelID}/deliveries`;
      const uberDirectResponse = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify(req.body)
      });
      if (!uberDirectResponse.ok) {
        throw new Error(`HTTP error! status: ${uberDirectResponse.status}`);
      }
      const uberDelivery = await uberDirectResponse.json()
      const updatedOrder = await Order.findOneAndUpdate(
        { _id: req.params.orderId },
        { uberId: uberDelivery.id },
        { new: true }
      );
      if (!updatedOrder) {
        return res.status(404).json({
          message: "Order not found."
        })
      }
      return res.status(200).json({
        updatedOrder
      })
    } catch (error) {
      return res.status(500).json({ message: error?.message });
    }
  });
  //Lister les livraisons
  router.get('/deliveries/:storeid', async (req, res) => {
    try {
      const costumelID = "00e54a63-2639-406b-8995-60260a1b57d8";
      const token = req.headers.authorization;
      const storeId = req.params.storeid;
      const url = `https://api.uber.com/v1/customers/${costumelID}/deliveries`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
      });
      if (response.ok) {
        const allDeliveries = await response.json();
        if ( allDeliveries !== null) {
          const deliveriesForStore =  allDeliveries.data.filter(item => {
            return item.pickup && item.pickup.external_store_id === storeId;
        });
          if (deliveriesForStore.length > 0) {
            res.json(deliveriesForStore);
          } else {res.status(404).json({ message: 'Aucune livraison pour ce magasin' }); }
        } else { res.status(500).json({ message: 'Les données de livraison ne sont pas au format attendu' });}
      } else {
        const errorData = await response.json();
        res.status(response.status).json(errorData);
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Une erreur s\'est produite' });
    }
  });
  //getdeleveryid
  router.get('/getUberDelivery/:delivery_id', async (req, res) => {
    try {
      const costumelID = "00e54a63-2639-406b-8995-60260a1b57d8";
        const {  delivery_id } = req.params;
        const token = req.headers.authorization;
        const url = `https://api.uber.com/v1/customers/${costumelID}/deliveries/${delivery_id}`;
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': token
          };
        const response = await fetch(url, {
            method: 'GET',
            headers: headers
        });
        if (response.ok) {
            const data = await response.json();
            res.json(data);
        } else {
            const errorData = await response.json();
            res.status(response.status).json(errorData);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Une erreur s\'est produite' });
    }
  });
  router.get('/deliveries', async (req, res) => {
    try {
      const costumelID = "00e54a63-2639-406b-8995-60260a1b57d8";
      const authToken = req.headers.authorization;
      const url = `https://api.uber.com/v1/customers/${costumelID}/deliveries`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${authToken}`
        },
      });
      if (response.ok) {
        const deliveries = await response.json();
        res.json(deliveries);
      } else {
        const errorData = await response.json();
        res.status(response.status).json(errorData);
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Une erreur s\'est produite' });
    }
  });
  //Créer une diffusion
  router.post('/Creer_diffusion/:devisID', async (req, res) => {
    try {
      const costumelID = "00e54a63-2639-406b-8995-60260a1b57d8";
      const devisID = req.params.devisID;
      const devisDetails = await DeliveryQuote.findById(devisID).exec();
      if (!devisDetails) { return res.status(404).json({ message: 'Order not found' }); }
      const authTokenn = req.headers.authorization;
      const url = `https://api.uber.com/v1/customers/${costumelID}/deliveries`;
      const uberDirectResponse = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${authTokenn}`
        },
        body: JSON.stringify({
        })
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'An error occurred while creating the Commande' });
    }
  });
  router.post('/cancels/:deliveryId', async(req, res) => {
    const customerId = "00e54a63-2639-406b-8995-60260a1b57d8";
    const deliveryId = req.params.deliveryId;
    const token = req.headers.authorization;
    const url = `https://api.uber.com/v1/customers/${customerId}/deliveries/${deliveryId}/cancel`;
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': token
    };
    const response = await fetch(url, {
      method: 'POST',
      headers: headers
    });
    if (response.ok) {
      const deliveries = await response.json();
      res.json(deliveries);
    } else {
      const errorData = await response.json();
      res.status(response.status).json(errorData);
    }
  });
  router.post('/cancel/:deliveryId/:orderId', async (req, res) => {
    try {
      const customerId = "00e54a63-2639-406b-8995-60260a1b57d8";
      const deliveryId = req.params.deliveryId;
      const token = req.headers.authorization;
      const url = `https://api.uber.com/v1/customers/${customerId}/deliveries/${deliveryId}/cancel`;
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': token
      }
      const response = await fetch(url, {
        method: 'POST',
        headers: headers
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json()
      const updatedOrder = await Order.findOneAndUpdate(
        { _id: req.params.orderId },
        { uberId: null },
        { new: true }
      );
      if (!updatedOrder) {
        return res.status(404).json({
          message: "Order not found."
        })
      }
      return res.status(200).json({
        updatedOrder,
        uberDelivery: data,
        message: "Delivery has been canceled successfully."
      })
    } catch (err) {
      res.status(500).json({
        message: err?.message
      })
    }
  })
   //update
   router.post('/create-delivery/:delivery_id', async (req, res) => {
    try {
      const  delivery_id  = req.params;
      const token = req.headers.authorization;
      const customerId = "00e54a63-2639-406b-8995-60260a1b57d8";
      const url = `https://api.uber.com/v1/customers/${customerId}/deliveries/${delivery_id}`;
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': token
      };
      const data = {
        "dropoff_notes": "Deuxième étage, porte noire à droite.",
        "dropoff_seller_notes": "Contenu fragile - veuillez manipuler la boîte avec soin lors de la livraison.",
        "manifest_reference": "REF0000002",
        "pickup_notes": "Suivez les grands panneaux verts 'Pickup' dans le parking",
        "dropoff_verification": {
          "barcodes": [{
            "value": "W1129082649-1",
            "type": "CODE39"
          }]
        },
        "tip_by_customer": 500
      };
      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(data)
      });
      const responseData = await response.json();
      res.status(response.status).json(responseData);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'An error occurred while creating the delivery' });
    }
  });
  router.post("/webhook", async (req, res) => {
    try {
        if(req.body.status!=="pending"){
            req.io.to(req.body.delivery_id).emit("receive_data", { data : {status : req.body.status,delivery_id :req.body.delivery_id } });
        }
        res.status(200).json({ message: "Data sent successfully" });
    } catch (error) {
        res.status(500).json({ message: error?.message });
    }
});

  module.exports = router;
