const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const { checkClient, checkOwner, checkManager } = require("../middlewares/authMiddleware.js");
const Store = require("../models/store.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../config.js");
const GroupeOption = require("../models/optionGroupe.js");
const order = require("../models/order.js");
const multer = require("multer");
const path = require("path");
const Option = require("../models/productOption.js");
const Menu = require("../models/menu.js");
const Product = require("../models/product.js");
const Category = require("../models/category.js");
const Company = require("../models/company.js");
const mongoose = require("mongoose");
const Tax = require("../models/tax.js");
const fs = require("fs");
const ConsumationMode = require("../models/mode");
const cors = require("cors");
const passport = require("passport");
const { sendWelcomeEmail } = require("../emailService.js");
const Mail = require("nodemailer/lib/mailer/index.js");
const { sendForgetpasswordclient } = require("../emailService.js");
const { sendVerificationClient } = require("../emailService.js");
const optionGroupe = require("../models/optionGroupe.js");
const ProductOption = require("../models/productOption.js");
const schedule = require("node-schedule");
require("../middlewares/passportSetup");

const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');
const handlebars = require('handlebars');  // Add this line to explicitly require handlebars
const request = require("request");

const transporter = nodemailer.createTransport({
  host: 'stone.o2switch.net',
  port: 465,
  auth: {
    type: 'custom',
    user: 'techsupport@eatorder.fr',
    pass: '&ofT+tW[i{}c',
  },
});

const handlebarOptions = {
  viewEngine: {
    extName: ".handlebars",
    partialsDir: path.resolve('./email-templates'),
    defaultLayout: false,
  },
  viewPath: path.resolve('./email-templates'),
  extName: ".handlebars",
};

transporter.use('compile', hbs(handlebarOptions));


router.post('/forgotpassword', async (req, res) => {
  const { email } = req.body;
  if (email) {
 console.log("forgot!!");  
 await User.findOne({ email }).then(resp => {
      if (!resp) {
        return res.status(404).json({
          message: "Email not found."
        });
      }
      const token = jwt.sign(
        { id: resp._id, role: resp.role },
        config.secret
      );
      const mailOptions = {
        from: 'techsupport@eatorder.fr',
        to: email,
        subject: 'Reset Password',
        template: 'resetPassword',
        context: {
          title: 'Reset Password',
          text: `https://redirect.eatorder.fr?id=${resp._id}&token=${token}`
        }
      };
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return res.status(500).json({
            message: "Error in sending e-mail."
          });
        } else {
          return res.status(200).json({
            message: "Email sent successfully."
          });
        }
      });

    }).catch(err => {
      return res.status(500).json({
        message: err?.message
      });
    })
  } else {
    return res.status(400).json({
      message:
        "No data found. Failed to send email",
    });
  }
})

router.put('/resetpassword', checkManager, async (req, res) => {
  const { password, id } = req.body;
  const saltRounds = 10;

  if (password && id) {
    await User.findById(id).then(async (resp) => {
      if (!resp) {
        return res.status(404).json({
          message: "User not found."
        });
      }
      const passwordMatches = await bcrypt.compare(password, resp.password);
      if (passwordMatches) {
        return res.status(400).json({
          message: "Password already used."
        });
      }

      const salt = await bcrypt.genSalt(saltRounds);
      const hashedPassword = await bcrypt.hash(password, salt);

      resp.password = hashedPassword;
      await resp.save();
      return res.status(200).json({ message: 'Password updated successfully.' });
    }).catch(err => {
      return res.status(500).json({
        message: err?.message
      });
    })
  } else {
    return res.status(400).json({
      message:
        "No data found. Failed to reset password",
    });

  }
})


// get stores name by user id
router.get("/getstoresnameandidbyuserid/:id", checkManager, async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await User.findById({ _id: userId }).populate("stores");
    const menus = await Promise.all(
      user.stores.map(async (store) => {
        const resp = await Menu.findOne({ store: store._id });
        return { currency: resp.currency };
      })
    );

    res.status(200).json({
      currencies: menus,
      stores: user.stores
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err?.message });
  }
});

//login
router.post("/login-", (req, res) => {
console.log("login");
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }
      bcrypt
        .compare(req.body.password, user.password)
        .then((valid) => {
          if (!valid) {
            return res.status(404).json({ message: "Incorrect password." });
          }
          const token = jwt.sign(
            { id: user._id, role: user.role },
            config.secret
          );
          return res.status(200).json({
            message: "Login success",
            token,
            user,
          });
        })
        .catch((error) => {
          console.error("Error comparing passwords:", error);
          return res.status(500).json({ message: err?.message });
        });
    })
    .catch((error) => {
      console.error("Error finding user by email:", error);
      return res.status(500).json({ message: err?.message });
    });
});
// update status of order by id (from restaurant's owner)
// router.put("/order/updatestatus", checkOwner, async (req, res) => {
//   try {
//     const { status, _id, preparationTime } = req.body;
//     if (status && _id) {
//       let data = preparationTime
//         ? {
//           status,
//           updatedAt: Date.now(),
//           preparedAt: new Date(Date.now() + preparationTime * 60000),
//         }
//         : { status, updatedAt: Date.now() };
//       const updateStatus = await order.findOneAndUpdate({ _id: _id }, data, {
//         new: true,
//       });
//       if (!updateStatus) {
//         return res.status(404).json({
//           message: "Order not found.",
//         });
//       }
//       return res.status(200).json({
//         message: "Status does update successfully.",
//         order: updateStatus,
//       });
//     }
//     return res.status(400).json({
//       message: "No data found. Failed to update order's status.",
//     });
//   } catch (err) {
//     return res.status(500).json({
//       message: err?.message,
//     });
//   }
// })

//get all orders by store
router.get("/order/allorders/:storeSelected/:page/:frombegining", checkManager, async (req, res) => {
  const perPage = 24;
  const page = parseInt(req.params.page); // Convert page to an integer

  const totalOrders = await order.countDocuments({ storeId: req.params.storeSelected });

  const skipCount = (page - 1) * perPage;

  if (req.params.frombegining.toString() === "true") {
    await order
      .find({ storeId: req.params.storeSelected })
      .sort({ _id: -1 })
      .limit(perPage * req.params.page)
      .populate({
        path: 'promo.promoId',
        model: 'Promo'
      })
      .exec()
      .then((response) => {
        return res.status(200).json({
          message: "All orders retrieved successfully.",
          orders: response,
          isLastPage: perPage * req.params.page >= totalOrders ? true : false
        });
      })
      .catch((err) => {
        return res.status(500).json({
          message: err?.message,
        });
      });
  } else {
    await order
      .find({ storeId: req.params.storeSelected })
      .sort({ _id: -1 })
      .skip(skipCount)
      .limit(perPage)
      .populate({
        path: 'promo.promoId',
        model: 'Promo'
      })
      .exec()
      .then((response) => {
        return res.status(200).json({
          message: "All orders retrieved successfully.",
          orders: response,
          isLastPage: skipCount + perPage >= totalOrders ? true : false
        });
      })
      .catch((err) => {
        return res.status(500).json({
          message: err?.message,
        });
      });
  }
});

//get accepted orders by store
router.get("/order/acceptedorders/:storeSelected/:page/:frombegining",checkManager,async (req, res) => {
  const perPage = 24;
  const page = parseInt(req.params.page); // Convert page to an integer

  const totalOrders = await order.countDocuments({ storeId: req.params.storeSelected, status: "accepted" });

  const skipCount = (page - 1) * perPage;

  if (req.params.frombegining.toString() === "true") {
    await order
      .find({ storeId: req.params.storeSelected, status: "accepted" })
      .sort({ _id: -1 })
      .limit(perPage * req.params.page)
      .populate({
        path: 'promo.promoId',
        model: 'Promo'
      })
      .exec()
      .then((response) => {
        return res.status(200).json({
          message: "All orders retrieved successfully.",
          orders: response,
          isLastPage: perPage * req.params.page >= totalOrders ? true : false
        });
      })
      .catch((err) => {
        return res.status(500).json({
          message: err?.message,
        });
      });
  } else {
    await order
      .find({ storeId: req.params.storeSelected, status: "accepted" })
      .sort({ _id: -1 })
      .skip(skipCount)
      .limit(perPage)
      .populate({
        path: 'promo.promoId',
        model: 'Promo'
      })
      .exec()
      .then((response) => {
        return res.status(200).json({
          message: "All orders retrieved successfully.",
          orders: response,
          isLastPage: skipCount + perPage >= totalOrders ? true : false
        });
      })
      .catch((err) => {
        return res.status(500).json({
          message: err?.message,
        });
      });
  }
});

//get ready orders by store
router.get("/order/readydorders/:storeSelected/:page/:frombegining", checkManager, async (req, res) => {
  const perPage = 24;
  const page = parseInt(req.params.page); // Convert page to an integer

  const totalOrders = await order.countDocuments({ storeId: req.params.storeSelected, status: "ready" });

  const skipCount = (page - 1) * perPage;

  if (req.params.frombegining.toString() === "true") {
    await order
      .find({ storeId: req.params.storeSelected, status: "ready" })
      .sort({ _id: -1 })
      .limit(perPage * req.params.page)
      .populate({
        path: 'promo.promoId',
        model: 'Promo'
      })
      .exec()
      .then((response) => {
        return res.status(200).json({
          message: "All orders retrieved successfully.",
          orders: response,
          isLastPage: perPage * req.params.page >= totalOrders ? true : false
        });
      })
      .catch((err) => {
        return res.status(500).json({
          message: err?.message,
        });
      });
  } else {
    await order
      .find({ storeId: req.params.storeSelected, status: "ready" })
      .sort({ _id: -1 })
      .skip(skipCount)
      .limit(perPage)
      .populate({
        path: 'promo.promoId',
        model: 'Promo'
      })
      .exec()
      .then((response) => {
        return res.status(200).json({
          message: "All orders retrieved successfully.",
          orders: response,
          isLastPage: skipCount + perPage >= totalOrders ? true : false
        });
      })
      .catch((err) => {
        return res.status(500).json({
          message: err?.message,
        });
      });
  }
});

// active or disactive store
router.put("/store/changestatus", checkManager, async (req, res) => {
  const { _id, active } = req.body;
  console.log(active);
  try {
    if (_id && active !== undefined) {
      const updateStatus = await Store.findOneAndUpdate(
        { _id: _id },
        { active },
        { new: true }
      );
      if (!updateStatus) {
        return res.status(404).json({
          message: "Store not found.",
        });
      }
      return res.status(200).json({
        message: updateStatus.active ? "Store is active" : "Store is disactive",
        store: updateStatus,
      });
    }
    return res.status(400).json({
      message: "No data found. Failed to update store's status.",
    });
  } catch (err) {
    return res.status(500).json({
      message: err?.message,
    });
  }
});

/* -------------------------------new--------------------------------------------------------------------------------------------------------------*/

// get all categorie and mode by category
router.get(
  "/menu/getallcategoriesbystoreid/:storeSelected", checkManager,
  async (req, res) => {
    await Menu.findOne({ store: req.params.storeSelected })
      .populate({
        path: "categorys",
        populate: { path: "availabilitys.mode", model: "ConsumationMode" },
      })
      .then((response) => {
        return res.status(200).json({
          message: "Categories by store does got successfully.",
          categories: response.categorys,
        });
      })
      .catch((err) => {
        return res.status(500).json({
          message: err?.message,
        });
      });
  }
);

// update availability by mode
router.put("/category/updateavailabiltybymode", checkManager, async (req, res) => {
  const { idCategory, idMode, value, storeId } = req.body;
  try {
    if (
      idCategory &&
      idMode &&
      (value === false || value === true) &&
      storeId
    ) {
      const updateStatus = await Category.findOneAndUpdate(
        { _id: idCategory, store: storeId, "availabilitys.mode": idMode },
        { "availabilitys.$.availability": value },
        { new: true }
      );
      if (!updateStatus) {
        return res.status(404).json({
          message: "Category not found.",
        });
      } else {
        await Menu.findOne({ store: storeId })
          .populate({
            path: "categorys",
            populate: { path: "availabilitys.mode", model: "ConsumationMode" },
          })
          .then((response) => {
            return res.status(200).json({
              message: value
                ? "Category by mode is now availabale."
                : "Category by mode is now not available.",
              categories: response.categorys,
            });
          });
      }
    } else {
      return res.status(400).json({
        message: "No data found. Failed to update availability by mode.",
      });
    }
  } catch (err) {
    return res.status(500).json({
      message: err?.message,
    });
  }
});

// update availability in category
router.put("/category/updateavailabilty", checkManager, async (req, res) => {
  const { idCategory, value, storeId } = req.body;
  console.log(req.body);
  try {
    if (idCategory && (value === false || value === true) && storeId) {
      const updateStatus = await Category.findOneAndUpdate(
        { _id: idCategory, store: storeId },
        { availability: value },
        { new: true }
      );
      if (!updateStatus) {
        return res.status(404).json({
          message: "Category not found.",
        });
      } else {
        await Menu.findOne({ store: storeId })
          .populate({
            path: "categorys",
            populate: { path: "availabilitys.mode", model: "ConsumationMode" },
          })
          .then((response) => {
            return res.status(200).json({
              message: value
                ? "Category is now available."
                : "Category is not available.",
              categories: response.categorys,
            });
          });
      }
    } else {
      return res.status(400).json({
        message: "No data found. Failed to update category availability.",
      });
    }
  } catch (err) {
    return res.status(500).json({
      message: err?.message,
    });
  }
});

// get all categorie and mode by category
router.get(
  "/menu/getallproductsbycategorybystoreid/:storeSelected/:categoryId", checkManager,
  async (req, res) => {
    await Menu.findOne({ store: req.params.storeSelected })
      .populate({
        path: "categorys",
        match: { _id: req.params.categoryId },
        populate: {
          path: "products",
          model: "Product",
          populate: { path: "availabilitys.mode", model: "ConsumationMode" },
        },
      })
      .then((response) => {
        return res.status(200).json({
          message: "Products by Category by store does got successfully.",
          products: response.categorys[0].products,
        });
      })
      .catch((err) => {
        return res.status(500).json({
          message: err?.message,
        });
      });
  }
);

// update availability by mode
router.put("/product/updateavailabiltybymode", checkManager, async (req, res) => {
  const { idCategory, idMode, value, storeId, idProduct } = req.body;
  try {
    if (
      idCategory &&
      idMode &&
      (value === false || value === true) &&
      storeId &&
      idProduct
    ) {
      const updateStatus = await Product.findOneAndUpdate(
        {
          _id: idProduct,
          storeId: storeId,
          category: idCategory,
          "availabilitys.mode": idMode,
        },
        { "availabilitys.$.availability": value },
        { new: true }
      );
      if (!updateStatus) {
        return res.status(404).json({
          message: "Product not found.",
        });
      } else {
        await Menu.findOne({ store: storeId })
          .populate({
            path: "categorys",
            match: { _id: idCategory },
            populate: {
              path: "products",
              model: "Product",
              populate: {
                path: "availabilitys.mode",
                model: "ConsumationMode",
              },
            },
          })
          .then((response) => {
            return res.status(200).json({
              message: value
                ? "Product by mode is now available."
                : "Product by mode is now not available.",
              products: response.categorys[0].products,
            });
          });
      }
    } else {
      return res.status(400).json({
        message:
          "No data found. Failed to update product availability by mode.",
      });
    }
  } catch (err) {
    return res.status(500).json({
      message: err?.message,
    });
  }
});

// update availability in product
router.put("/product/updateavailabilty", checkManager, async (req, res) => {
  const { idCategory, value, storeId, idProduct } = req.body;
  try {
    if (
      idCategory &&
      (value === false || value === true) &&
      storeId &&
      idProduct
    ) {
      const updateStatus = await Product.findOneAndUpdate(
        { _id: idProduct, category: idCategory, storeId: storeId },
        { availability: value },
        { new: true }
      );
      if (!updateStatus) {
        return res.status(404).json({
          message: "Product not found.",
        });
      } else {
        await Menu.findOne({ store: storeId })
          .populate({
            path: "categorys",
            match: { _id: idCategory },
            populate: {
              path: "products",
              model: "Product",
              populate: {
                path: "availabilitys.mode",
                model: "ConsumationMode",
              },
            },
          })
          .then((response) => {
            return res.status(200).json({
              message: value
                ? "Product is now available."
                : "Product is now not available.",
              products: response.categorys[0].products,
            });
          });
      }
    } else {
      return res.status(400).json({
        message: "No data found. Failed to update product availability.",
      });
    }
  } catch (err) {
    return res.status(500).json({
      message: err?.message,
    });
  }
});


router.post('/getUberToken', (req, res) => {
  const options = {
    method: 'POST',
    url: 'https://auth.uber.com/oauth/v2/token',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    form: {
      client_id: 'IA9Ao-3jrYRWPH1WiNQjZnyK3mnQj5H2',
      client_secret: 'wFczGm0OfeMqc4qTx6I1yl0NERNzgGBO4cIOW-3E',
      grant_type: 'client_credentials',
      scope: 'eats.deliveries',
    },
  };
  request(options, (error, response, body) => {
    if (error) {
      console.log(error);
      return res.status(500).json({ message: error?.message });
    } else {
      return res.json({ accessToken: JSON.parse(body).access_token });
    }
  });
});


router.post('/createquote/:orderID', async (req, res) => {
  try {
    const costumelID = "66d29428-580c-5ddf-9ee1-93482329f960";
    const orderID = req.params.orderID;
    const orderDetails = await order.findOne({ _id: orderID }).exec()
    if (!orderDetails) {
      return res.status(404).json({
        message: "Order not found."
      })
    }
    const authTokenn = req.headers.authuber;
    const url = `https://api.uber.com/v1/customers/${costumelID}/delivery_quotes`;

    const uberDirectResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': "Bearer " + authTokenn
      },
      body: JSON.stringify({
        pickup_address: orderDetails.restaurantAdress.toString(),
        dropoff_address: orderDetails.deliveryAdress.toString(),
        external_store_id: orderDetails.storeId.toString()
      })
    });

    const uberDirectData = await uberDirectResponse.json();
    if (uberDirectResponse.ok) {
      return res.status(200).json({
        message: 'Commande created successfully',
        uberDirectData
      });
    } else {
      return res.status(400).json({
        message: uberDirectData.message,
      })
    }
  } catch (error) {
    return res.status(500).json({ message: error?.message });
  }
});



//Créer une diffusion
router.post('/createdelivery/:orderId', async (req, res) => {
  try {
    const costumelID = "66d29428-580c-5ddf-9ee1-93482329f960";
    const authTokenn = req.headers.authuber;
    // create uber delivery
    const url = `https://api.uber.com/v1/customers/${costumelID}/deliveries`;
    const uberDirectResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': "Bearer " + authTokenn
      },
      body: JSON.stringify(req.body)
    });
    const uberDelivery = await uberDirectResponse.json()
    if (!uberDirectResponse.ok) {
      return res.status(400).json({
        message: uberDelivery.message,
      })
      // throw new Error(`HTTP error! status: ${uberDirectResponse.status}`);
    }
    const updatedOrder = await order.findOneAndUpdate(
      { _id: req.params.orderId },
      { uberId: uberDelivery.id },
      { new: true }
    );
    if (!updatedOrder) {
      return res.status(404).json({
        message: "Order not found."
      })
    }

    const url2 = `https://api.uber.com/v1/customers/${costumelID}/deliveries/${uberDelivery.id}`
    const response = await fetch(url2, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': "Bearer " + authTokenn
      }
    })

    const data = await response.json()
    if (!response.ok) {
      return res.status(400).json({
        message: data.message,
      })
      // throw new Error(`HTTP error! status: ${response.status}`);
    }

    return res.status(200).json({
      uberDelivery: data,
      updatedOrder
    })
  } catch (error) {
    return res.status(500).json({ message: error?.message });
  }
});

router.post("/getdeliverybid/:delid", async (req, res) => {
  try {
    const costumelID = "66d29428-580c-5ddf-9ee1-93482329f960";
    const authTokenn = req.headers.authuber;
    const url = `https://api.uber.com/v1/customers/${costumelID}/deliveries/${req.params.delid}`
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': "Bearer " + authTokenn
      }
    })

    const data = await response.json()
    if (!response.ok) {
      return res.status(400).json({
        message: data.message,
      })
      // throw new Error(`HTTP error! status: ${response.status}`);
    }
    return res.status(200).json({
      uberDelivery: data,
      message: "Data does got successfully."
    })
  } catch (err) {
    return res.status(500).json({
      message: err?.message
    })
  }
})

router.post('/cancel/:deliveryId/:orderId', async (req, res) => {
  try {
    const customerId = "66d29428-580c-5ddf-9ee1-93482329f960";
    const deliveryId = req.params.deliveryId;
    const token = req.headers.authuber;
    const url = `https://api.uber.com/v1/customers/${customerId}/deliveries/${deliveryId}/cancel`;
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
    const response = await fetch(url, {
      method: 'POST',
      headers: headers
    })

    const data = await response.json()
    if (!response.ok) {
      return res.status(400).json({
        message: data.message,
      })
      // throw new Error(`HTTP error! status: ${response.status}`);
    }
    const updatedOrder = await order.findOneAndUpdate(
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


router.post("/proofofdelivery/:delivery_id/:waypoint", async (req, res) => {
  try {
    const customer_id = "66d29428-580c-5ddf-9ee1-93482329f960";
    const delivery_id = req.params.delivery_id
    const token = req.headers.authuber
    const waypoint = req.params.waypoint
    const url = `https://api.uber.com/v1/customers/${customer_id}/deliveries/${delivery_id}/proof-of-delivery`;
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
    const obj = {
      "waypoint": waypoint,
      "type": "picture"
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(obj)
    });

    const data = await response.json()
    if (!response.ok) {
      return res.status(400).json({
        message: data.message,
      })
      // throw new Error(`HTTP error! status: ${response.status}`);
    }
    return res.status(200).json({
      data: data,
      success: true
    })
  } catch (err) {
    res.status(500).json({
      message: err?.message
    })
  }
})


router.put("/updateorganization", async (req, res) => {
  try {
    // {name : "Uber direct",storeId , option : "Manual" || "Automatic"}
    const { name, storeId, option } = req.body
    const store = await Store.findOne({ _id: storeId })
    if (!store) {
      return res.status(404).json({
        message: "Store not found."
      })
    }
    const index = store.organizations.findIndex(organization => organization.name === name)

    if (index !== -1) {
      const updatedOrganizations = store.organizations.map((org, idx) => ({
        ...org,
        options: org.options.map(option => ({ ...option, checked: idx !== index && false }))
      }));
      store.organizations = updatedOrganizations

      let data = store.organizations[index].options
      if (data.filter(option => option.checked).length === 0) {
        for (let i = 0; i < data.length; i++) {
          if (option === data[i].name) {
            data[i].checked = !data[i].checked
          }
        }
      } else {
        for (let i = 0; i < data.length; i++) {
          data[i].checked = !data[i].checked
        }
      }
      store.organizations[index].options = data
      const updateStore = await Store.updateOne({ _id: storeId }, { organizations: store.organizations }, { new: true })
      if (!updateStore) {
        return res.status(400).json({
          message: "Update store was failed."
        })
      }
      return res.status(200).json({
        message: "Update store does successfully.",
        data: updateStore.organizations
      })
    }

  } catch (err) {
    res.status(500).json({
      message: err?.message
    })

  }
})

router.put("/updateorganizationstooff", async (req, res) => {
  try {
    const { storeId } = req.body

    const store = await Store.findOne({ _id: storeId })
    if (!store) {
      return res.status(404).json({
        message: "Store not found."
      })
    }

    const updatedOrganizations = store.organizations.map((org) => ({
      ...org,
      options: org.options.map(option => ({ ...option, checked: false }))
    }));

    store.organizations = updatedOrganizations

    const updateStore = await Store.updateOne({ _id: storeId }, { organizations: store.organizations }, { new: true })
    if (!updateStore) {
      return res.status(400).json({
        message: "Update store was failed."
      })
    }
    return res.status(200).json({
      message: "Update store does successfully.",
      data: updateStore.organizations
    })

  } catch (err) {
    res.status(500).json({
      message: err?.message
    })

  }
})

router.put("/managingacceptedorders", async (req, res) => {
  try {
    const { preparationTime, Manual, Automatic, storeId } = req.body

    const updateStore = await Store.findOneAndUpdate({ _id: storeId }, { managingacceptedorders: { preparationTime, Manual, Automatic } }, { new: true })

    if (!updateStore) {
      return res.status(400).json({
        message: "Update store was failed."
      })
    }
    return res.status(200).json({
      message: "Update store does successfully.",
      data: updateStore.managingacceptedorders
    })

  } catch (err) {
    res.status(500).json({
      message: err?.message
    })
  }
})

router.put("/update-connected-mobile-user", async (req, res) => {
  try {
    const { connectedMobileUser, storeId, disconnectUser } = req.body

    if (!disconnectUser) {
      const updateConnectedUser = await Store.findOneAndUpdate({ _id: storeId, connectedMobileUser: null }, { connectedMobileUser: connectedMobileUser }, { new: true })
      if (!updateConnectedUser) {
        return res.status(400).json({
          message: "Already mobile user connected."
        })
      }
      return res.status(200).json({
        store: updateConnectedUser,
        message: "Mobile user connect with successfull."
      })
    }
    const updateConnectedUser = await Store.findOneAndUpdate({ _id: storeId }, { connectedMobileUser: null }, { new: true })
    return res.status(200).json({
      store: updateConnectedUser,
      message: "Mobile user disconnect with successfull."
    })

  } catch (err) {
    return res.status(500).json({
      message: err?.message
    })
  }
})
//Lister les livraisons
// router.get('/deliveries', async (req, res) => {
//   try {
//     const costumelID = "66d29428-580c-5ddf-9ee1-93482329f960";
//     const authToken = req.headers.authorization;
//     console.log('Authorization Token:', authToken);
//     const url = `https://api.uber.com/v1/customers/${costumelID}/deliveries`;
//     const response = await fetch(url, {
//       method: 'GET',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': ` ${authToken}`
//       },
//     });
//     if (response.ok) {
//       const deliveries = await response.json();
//       res.json(deliveries);
//     } else {
//       const errorData = await response.json();
//       res.status(response.status).json(errorData);
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Une erreur s\'est produite' });
//   }
// });


router.put("/updatePaymentStatus", async (req, res) => {
  try {
    const { orderId } = req.body
    const updatePaymentStatus = await order.findOneAndUpdate({ _id: orderId }, { paymentStatus: "paid" }, { new: true })
    if (!updatePaymentStatus) {
      return res.status(400).json({
        message: "Order not found."
      })
    }
    return res.status(200).json({
      order: updatePaymentStatus,
      message: "Payment status updated successfully."
    })
    
  } catch (err) {
    return res.status(500).json({
      message: err?.message
    })
  }
})
router.put("/updatePickupNotes", async (req, res) => {
  try {
    const { storeId,pickupNotes } = req.body
    const updatePickupNote = await Store.findOneAndUpdate({ _id: storeId }, { pickupNotes: pickupNotes }, { new: true })
    if (!updatePickupNote) {
      return res.status(400).json({
        message: "Store not found."
      })
    }
    return res.status(200).json({
      store: updatePickupNote,
      message: "Pickup notes updated successfully."
    })
    
  } catch (err) {
    return res.status(500).json({
      message: err?.message
    })
  }
})


/* -------------------------------new--------------------------------------------------------------------------------------------------------------*/

module.exports = router;
