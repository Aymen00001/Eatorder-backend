const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const { checkClient } = require("../middlewares/authMiddleware.js");
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
const Promo = require("../models/promo.js");
const stripe = require("stripe")("sk_test_51OdqTeD443RzoOO5zes08H5eFoRH1W4Uyv2sZU8YMmpGM7fU9FKqpIDF87xml7omZVugkMmjfW3YhBG7R5ylxQTJ00lH5Qdpji");
const Specialite = require('../models/specialite.js');
const Guest = require("../models/guest.js");
const twilio = require('twilio');

// Configuration de Twilio
const accountSid = 'ACa957483cf5dd96c726d91234e58896b3';
const authToken = '6fa8e1c8c749bc0f29ac6d01537d4f7d';
const client = new twilio(accountSid, authToken);
const twilioNumber = '+12564454171';
//------
require("../middlewares/passportSetup");




// delete All cache start with this string (chaine):
function deleteKeysStartingWithAdf(chaine) {
  const keysToDelete = [];
  const keys = cache.keys();

  keys.forEach(key => {
    if (key.startsWith(chaine)) {
      keysToDelete.push(key);
    }
  });

  keysToDelete.forEach(key => {
    cache.del(key);
  });
}

// En cas de changement en table store delete cache storesByCompany :
// Store.watch().on("change", async (change) => {
//   const { documentKey, operationType } = change;
//   if (operationType === "update") {
//     const response = await Store.findOne({ _id: documentKey._id });
//     console.log("delete cache : storesByCompany  for store with id :", documentKey._id, "!!!! ;)")
//     cache.del("storesByCompany" + response.companyId);
//   } else {
//     console.log("delete cache storesByCompany for all stores  !!!! ;)")
//     deleteKeysStartingWithAdf("storesByCompany");
//   }
// });
// // En cas de changement en table company delete cache storesByCompany :
// Company.watch().on("change", async (change) => {
//   const { documentKey, operationType } = change;
//   if (operationType === "update") {
//     console.log("delete cache : storesByCompany  IN company with  id :", documentKey._id, "!!!! ;)")
//     cache.del("storesByCompany" + documentKey._id);
//   } else {
//     console.log("delete cache storesByCompany for ALL STORES   !!!! ;)")
//     deleteKeysStartingWithAdf("storesByCompany");

//   }
// });
// // En cas de changement en table Menu delete cache menuByStore :
// Menu.watch().on("change", async (change) => {
//   const { documentKey, operationType } = change;
//   if (operationType === "update") {
//     const response = await Menu.findOne({ _id: documentKey._id });
//     console.log("delete cache : menuByStore  for store with id :", response.store, "!!!! ;)")
//     cache.del("menuByStore" + response.store);
//   } else {
//     deleteKeysStartingWithAdf("menuByStore");
//     console.log("delete cache menuByStore for all stores  !!!! ;)")
//   }
// });
// // En cas de changement en category Menu delete cache menuByStore :
// Category.watch().on("change", async (change) => {
//   const { documentKey, operationType } = change;

//   if (operationType === "update") {
//     const response = await Category.findOne({ _id: documentKey._id });
//     console.log("delete cache : menuByStore  for store with id :", response.store, "!!!! ;)")
//     cache.del("menuByStore" + response.store);
//   } else {
//     deleteKeysStartingWithAdf("menuByStore");
//     console.log("delete cache menuByStore for all stores  !!!! ;)")
//   }
// });


// // En cas de changement en Product delete cache products-by-store :
// Product.watch().on("change", async (change) => {
//   const { documentKey, operationType } = change;

//   if (operationType === "update") {
//     const response = await Product.findOne({ _id: documentKey._id });
//     console.log("delete cache : products-by-store  for store with id :", response.storeId, "!!!! ;)")
//     deleteKeysStartingWithAdf("products-by-store" + response.storeId)

//     // promos-by-store
//     deleteKeysStartingWithAdf("promos-by-store" + response.storeId)

//   } else {
//     deleteKeysStartingWithAdf("products-by-store");

//     // promos-by-store
//     deleteKeysStartingWithAdf("promos-by-store")
//     console.log("delete cache products-by-store for all stores  !!!! ;)")
//   }
// });

// ProductOption.watch().on("change", async (change) => {
//   const { documentKey, operationType } = change;

//   if (operationType === "update") {
//     const response = await ProductOption.findOne({ _id: documentKey._id });
//     console.log("delete cache : products-by-store  for store with id :", response.store, "!!!! ;)")
//     deleteKeysStartingWithAdf("products-by-store" + response.store)


//     // promos-by-store
//     deleteKeysStartingWithAdf("promos-by-store" + response.store)
//   } else {
//     deleteKeysStartingWithAdf("products-by-store");

//     // promos-by-store
//     deleteKeysStartingWithAdf("promos-by-store")

//     console.log("delete cache products-by-store for all stores  !!!! ;)")
//   }
// });

// optionGroupe.watch().on("change", async (change) => {
//   const { documentKey, operationType } = change;

//   if (operationType === "update") {
//     const response = await optionGroupe.findOne({ _id: documentKey._id });
//     console.log("delete cache : products-by-store  for store with id :", response.store, "!!!! ;)")
//     deleteKeysStartingWithAdf("products-by-store" + response.store)

//     // promos-by-store
//     deleteKeysStartingWithAdf("promos-by-store" + response.store)

//   } else {
//     // promos-by-store
//     deleteKeysStartingWithAdf("promos-by-store")
//     deleteKeysStartingWithAdf("products-by-store");
//     console.log("delete cache products-by-store for all stores  !!!! ;)")
//   }
// });

// Tax.watch().on("change", async (change) => {
//   const { documentKey, operationType } = change;

//   if (operationType === "update") {
//     const response = await Tax.findOne({ _id: documentKey._id });
//     console.log("delete cache : products-by-store  for store with id :", response.storeId, "!!!! ;)")
//     deleteKeysStartingWithAdf("products-by-store" + response.storeId)


//     // promos-by-store
//     deleteKeysStartingWithAdf("promos-by-store" + response.storeId)
//   } else {
//     // promos-by-store
//     deleteKeysStartingWithAdf("promos-by-store")
//     deleteKeysStartingWithAdf("products-by-store");
//     console.log("delete cache products-by-store for all stores  !!!! ;)")
//   }
// });

// // ConsumationMode.watch().on("change", async (change) => {
// //   const { documentKey, operationType } = change;

// //   if (operationType === "update") {
// //     const response = await ConsumationMode.findOne({ _id: documentKey._id });
// //     console.log("delete cache : products-by-store  for store with id :", response.store, "!!!! ;)")
// //     deleteKeysStartingWithAdf("products-by-store" + response.store)

// //     // cache.del("products-by-store" + response.store);
// //   } else {
// //     deleteKeysStartingWithAdf("products-by-store");
// //     console.log("delete cache products-by-store for all stores  !!!! ;)")
// //   }
// // });


// // En cas de changement en Product delete cache promos-by-store :

// Promo.watch().on("change", async (change) => {
//   const { documentKey, operationType } = change;

//   if (operationType === "update") {
//     const response = await Promo.findOne({ _id: documentKey._id });
//     console.log("delete cache : promos-by-store  for store with id :", response.storeId, "!!!! ;)")
//     deleteKeysStartingWithAdf("promos-by-store" + response.storeId)

//     // cache.del("products-by-store" + response.store);
//   } else {
//     deleteKeysStartingWithAdf("promos-by-store");
//     console.log("delete cache promos-by-store for all stores  !!!! ;)")
//   }
// });

// Category.watch().on("change", async (change) => {
//   const { documentKey, operationType } = change;

//   if (operationType === "update") {
//     const response = await Category.findOne({ _id: documentKey._id });
//     console.log("delete cache : promos-by-store for store with id :", response.store, "!!!! ;)")
//     deleteKeysStartingWithAdf("promos-by-store" + response.store)

//     // cache.del("products-by-store" + response.store);
//   } else {
//     deleteKeysStartingWithAdf("promos-by-store");
//     console.log("delete cache promos-by-store for all stores  !!!! ;)")
//   }
// });




//check client
router.post("/checkclient", async (req, res) => {
  try {
    const { token } = req.body
    const decodedToken = jwt.verify(token, config.secret);
    if (decodedToken.role === "client") {
      res.status(200).json({
        success: true,
        msg: "User found !",
        userIds: decodedToken.id
      })
    } else {
      res
        .status(400)
        .json({ success: false, msg: "Unauthorized user" });
    }
  } catch (err) {
    res
      .status(500)
      .json({ success: false, msg: err?.message });
  }
})

// Register guest user
router.post("/registerGuest", async (req, res) => {
  try {
    const { firstName, lastName, address, email } = req.body;
    // Check if the guest already exists
    let guest;
    // if (firstName && lastName) {
    //   guest = await Guest.findOne({ firstName, lastName });
    // } else
    //  if (address) {
    //   guest = await Guest.findOne({ address });
    // } else if (email) {
    //   guest = await Guest.findOne({ email });
    // } else {
    //   return res.status(400).json({ error: "Missing required fields!" });
    // }
    // if (guest) {
    //   return res.status(400).json({ error: "Guest already exists!" });
    // }
    // Create a new guest
    guest = new Guest({
      firstName,
      lastName,
      address,
      email,
    });
    // Save the guest to the database
    await guest.save();
    const token = jwt.sign({ id: guest._id, role: "ClientGuest" }, config.secret);
    res.cookie("token", token);
    return res.status(200).json({
      message: "Guest registered successfully",
      token,
      guest,
    });
  } catch (error) {
    // Handle any errors that occur during the process
    console.error("Error registering guest:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Function to generate a random verification code
function generateVerificationCode(length) {
  const characters = '0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    const index = Math.floor(Math.random() * characters.length);
    code += characters[index];
  }
  return code;
}
//send sms 

router.post('/sendSMS', async (req, res) => {
  const { firstName, lastName, phoneNumber } = req.body;

  // Check if required fields are provided
  if (!firstName || !lastName || !phoneNumber) {
    return res.status(400).json({ error: 'Missing guest information' });
  }

  // Generate a random verification code
  const verificationCode = generateVerificationCode(6); // Adjust the length as needed

  try {
    // Check if guest exists
    let guest = await Guest.findOne({ firstName, lastName, phoneNumber });

    if (!guest) {
      // If guest doesn't exist, create a new one
      guest = new Guest({
        firstName,
        lastName,
        phoneNumber,
        verificationCode
      });
    } else {
      // If guest exists, update verification code
      guest.verificationCode = verificationCode;
    }

    // Save guest information
    await guest.save();

    // Send the SMS
    const message = await client.messages.create({
      body: `Votre code de vÃ©rification est ${verificationCode}`,
      from: twilioNumber,
      to: phoneNumber
    });

    // Return success response
    res.status(200).json({ message: 'Guest saved and SMS sent successfully', messageId: message.sid });
  } catch (err) {
    console.error('Error sending SMS:', err);

    // Handle Twilio specific errors
    if (err.code === 21608) {
      return res.status(400).json({ error: 'Le numÃ©ro de tÃ©lÃ©phone n\'est pas vÃ©rifiÃ©. Veuillez vÃ©rifier le numÃ©ro sur Twilio Console.' });
    }

    // Handle other errors
    res.status(500).json({ error: 'Error sending SMS' });
  }
});



//login mode guest
router.post("/loginGuest", async (req, res) => {
  try {
    const { phoneNumber, firstName, lastName, verificationCode } = req.body;
    const guest = await Guest.findOne({ phoneNumber, firstName, lastName, verificationCode });
    if (!guest) {
      return res.status(401).json({ error: "Guest not found!" });
    }
    const token = jwt.sign({ id: guest._id, role: "ClientGuest" }, config.secret);
    res.cookie("token", token);
    return res.status(200).json({
      message: "Login success",
      token,
      guest,
    });
  } catch (error) {
    // Handle any errors that occur during the process
    console.error("Error finding guest:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET guest information by phone number
router.get('/guest/:phoneNumber/:firstName/:lastName', async (req, res) => {
  const phoneNumber = req.params.phoneNumber;
  const firstName = req.params.firstName;
  const lastName = req.params.lastName;
  try {
    const guest = await Guest.findOne({ phoneNumber, firstName, lastName });
    if (!guest) {
      return res.status(404).json({ error: 'Guest not found' });
    }
    res.status(200).json(guest);
  } catch (err) {
    console.error('Error retrieving guest information:', err);
    res.status(500).json({ error: 'Error retrieving guest information' });
  }
});


//signup
router.post("/signup", (req, res) => {
  bcrypt
    .hash(req.body.password, 10)
    .then((hash) => {
      // Create a new User instance with the hashed password
      const user = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        phoneNumber: req.body.phoneNumber,
        password: hash,
        sexe: req.body.sexe,
        role: "client",
      });
      user
        .save()
        .then(() => res.status(201).json({ message: "User created !", user }))
        .catch((error) => {
          console.error("Error saving user:", error);
          res
            .status(500)
            .json({ error: "An error occurred while saving the user." });
        });
    })
    .catch((error) => {
      console.error("Error hashing password:", error);
      res
        .status(500)
        .json({ error: "An error occurred while hashing the password." });
    });
});

router.get("/UserExistOrNot/:email", async (req, res) => {
  const email = req.params.email;
  const user = await User.findOne({ email: email})
 
  if (user) { 
     return res.status(200).json({ message: "User Exist" });  
            }
  else      {
    return res.status(200).json({ message: "User not found!" });
            }
});


//login
router.post("/login", async (req, res) => {
    const user = await User.findOne({ email: req.body.email })
    if (user === null) {
      return res.status(200).json({ message: 'user not exist'  });
    }
  

  User.findOne({ email: req.body.email })
    .then((user) => {


      if (!user) {
        return res.status(401).json({ error: "..." });
      }


      bcrypt
        .compare(req.body.password, user.password)
        .then(async (valid) => {

          if (!valid) {
            return res.status(401).send({ error: "Incorrect password" });
          }

          if (user.verifid === false && Date.now() - user.createdAt < (24 * 60 * 60 * 1000)) {
            return res.status(400).json({ error: "User found! Please verify your account." });
          }
          if (user.verifid === false && Date.now() - user.createdAt >= (24 * 60 * 60 * 1000)) {
            await User.deleteOne({ email: user.email })
            return res.status(400).json({ error: "User not found!" });

          }

          const token = jwt.sign(
            { id: user._id, role: user.role },
            config.secret
          );

          res.cookie("token", token);
          return res.status(200).json({
            message: "Login success",
            token,
            user,
          });
        })
        .catch((error) => {
          // console.error("Error comparing passwords:", error);
          return res.status(500).json({ error: error?.message });
        });
    })
    .catch((error) => {
      // console.error("Error finding user by email:", error);
      return res.status(500).json({ error: error?.message });
    });
});

//api check email
router.post("/checkEmail", async (req, res) => {
  try {
    const email = req.body.email; // Email is now expected in the request body
    const existEmail = await User.findOne({ email });

    console.log(existEmail);
    if (existEmail) {
      return res.status(200).json({ exists: true });
    } else {
      return res.status(200).json({ exists: false });
    }
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while checking the email." });
  }
});

//failed login google
router.get("/loginGoogle/failed", (req, res) => {
  res.status(401).json({
    error: true,
    message: "Log in failure",
  });
});

// email verification
router.put("/verification/:id", async (req, res) => {
  try {
    console.log("verification");
    const clientId = req.params.id;
    // VÃ©rifier si le propriÃ©taire existe
    const client = await User.findById(clientId);
    if (client.verifid === false) {




      if (!client) {
        return res.status(404).json({ message: "client non trouvÃ©" });
      }

      client.verifid = true;
      await client.save();
      res.json({ success: true, message: "client verifie", user: client });



    } else {
      res.status(400).json({
        message: "Unauthorized to access this route"
      })
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Une erreur est survenue lors de la verification du client",
    });
  }
});
//send email verif
router.post("/sendVerification/:id", async (req, res, next) => {
  try {
    const clienId = req.params.id;
    console.log(clienId);

    // VÃ©rifier si l'utilisateur existe
    const user = await User.findById(clienId);
    if (!user) {
      return res.status(404).json({ message: "owner not found" });
    }

    // GÃ©nÃ©rer un jeton JWT
    const token = jwt.sign({ id: user._id, role: user.role }, config.secret);

    // Envoyer le jeton JWT Ã  l'utilisateur

    res.cookie("user", user);
    res.json({ token, user });
    sendVerificationClient(user.email, user.id, token, "https://server.eatorder.fr:8000");
  } catch (error) {
    next(error); // Passer l'erreur au middleware de capture des erreurs
  }
});

//forget password
router.post("/forgetPassword", async (req, res, next) => {
  try {
    const { email } = req.body;

    // VÃ©rifier si l'utilisateur existe
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "Utilisateur non trouvÃ©" });

    // GÃ©nÃ©rer un jeton JWT
    const token = jwt.sign({ id: user._id, role: user.role }, config.secret);

    // Envoyer le jeton JWT Ã  l'utilisateur
    res.json({ token, user });
    sendForgetpasswordclient(email, user.id, token);
  } catch (error) {
    next(error); // Passer l'erreur au middleware de capture des erreurs
  }
});

//reset password
router.put("/resetPassword/:id", checkClient, async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;
  const saltRounds = 10;
  console.log(id);
  console.log(password);
  try {
    // Retrieve user from the database based on the provided ID
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Verify if the provided current password matches the one stored in the database

    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Assigner le mot de passe hachÃ© Ã  l'admin

    // Hash the new password

    // Update the user's password in the database
    user.password = hashedPassword;
    await user.save();

    // Return a success response
    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//login with google
router.get("/google", passport.authenticate("google", ["profile", "email"]));
//callback login with google
router.get("/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/loginGoogle/failed",
  }),
  async (req, res) => {
    if (!req.user) {
      return res.redirect("https://market.eatorder.fr");
    }
    const googleProfile = req.user;
    try {
      const user = await User.findOne({ email: googleProfile.email });
      if (!user) {
        const userData = {
          firstName: googleProfile.name.givenName,
          lastName: googleProfile.name.familyName,
          email: googleProfile.email,
          role: "client",
        };
        const newUser = new User(userData);
        const accessToken = jwt.sign(
          { id: newUser._id, role: newUser.role },
          config.secret
        );
        await newUser.save();
        return res.redirect(`https://market.eatorder.fr?token=${accessToken}&user=${encodeURIComponent(JSON.stringify(newUser))}`);
      }
      const accessToken = jwt.sign(
        { id: user._id, role: user.role },
        config.secret
      );
      return res.redirect(`https://market.eatorder.fr?token=${accessToken}&user=${encodeURIComponent(JSON.stringify(user))}`);
    } catch (err) {
      console.error("Error saving user data:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
);
// Route to handle phone number verification
router.post("/verify-phone/:userId", async (req, res) => {
  const userId = req.params.userId;
  const phoneNumber = req.body.phoneNumber;
  const sexe = req.body.gender;
  const token = req.query.token;

  console.log("Phone number:", phoneNumber);
  console.log("Gender:", sexe);

  try {
    const user = await User.findById(userId);

    console.log("User:", user);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.phoneNumber = phoneNumber;
    user.sexe = sexe;
    user.verifid = true;
    await user.save();

    console.log("User saved successfully");
    res.status(200).json({
      message: "Phone number and gender verified and updated successfully",
    });
  } catch (err) {
    console.error("Error updating user data:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//get all stores
router.get("/stores", async (req, res) => {
  const stores = await Store.find();
  res.send(stores);
});
//get All owners
router.get("/owners", async (req, res) => {
  const owners = await User.find({ role: "owner" });
  res.send(owners);
});
//get all companies
router.get("/companies", async (req, res) => {
  const companies = await Company.find();
  res.send(companies);
});

router.get("/company/:id", async (req, res) => {
  await Company.find({ _id: req.params.id })
    .then((resp) => {
      res.send(resp);
    })
    .catch((err) => {
      res.send(err);
    });
});

//get storeByid
router.get("/store/:_id", async (req, res) => {
  const _id = req.params._id;
  try {
    if (_id.length === 24) {
      const store = await Store.findOne({ _id });
      if (!store) {
        return res.status(404).json({ message: "Store not found" });
      }

      return res.status(200).json(store);
    } else {
      return res.status(404).json({ message: "Store not found" });
    }
  } catch (err) {
    console.error("Error fetching store: ", err);
    return res.status(500).json({ error: err?.message });
  }
});

// get store by company
// router.get("/storeByCompany/:companyId", async (req, res) => {
//   const companyId = req.params.companyId;
//   try {
//     const stores = await Store.find({ company: companyId }).populate(
//       "categories products"
//     );
//     if (stores.length === 0) {
//       return res
//         .status(404)
//         .json({ message: "No stores found for this owner" });
//     }
//     res.status(200).json(stores);
//   } catch (err) {
//     console.error("Error fetching stores: ", err);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

// Get stores by company

async function filterStoresByProducts(stores) {
  const filteredStores = [];

  for (const store of stores) {
    const products = await Product.find({ storeId: store._id }).exec();
    if (products.length > 0) {
      filteredStores.push(store);
    }
  }

  return filteredStores;
}
router.get("/storesByCompany/:companyId", async (req, res) => {
  const companyId = req.params.companyId;
  const cache = req.app.locals.cache;
  
  try {
    const cd = cache.get("storesByCompany" + companyId);
    if (cd) {
      const deserializedStores = JSON.parse(cd);
      console.log('Stores by company served from cache');
      return res.json(deserializedStores);
    }

    const company = await Company.findOne({ _id: companyId }).populate("stores");

    // Filter stores to include only those with associated products
    const storesWithProducts = await filterStoresByProducts(company.stores);

    // Update company object with filtered stores
    company.stores = storesWithProducts;

    const serializedCompany = JSON.stringify(company);
    cache.set("storesByCompany" + companyId, serializedCompany);

    res.status(200).json(company);
  } catch (err) {
    console.error("Error fetching stores: ", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}); 


//get store by owner
router.get("/storeByOwner/:ownerId", async (req, res) => {
  const ownerId = req.params.ownerId;
  try {
    const stores = await Store.find({ owner: ownerId }).populate(
      "categories products"
    );
    if (stores.length === 0) {
      return res
        .status(404)
        .json({ message: "No stores found for this owner" });
    }
    res.status(200).json(stores);
  } catch (err) {
    console.error("Error fetching stores: ", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//get menu by store/
router.get("/getMenuByStore/:storeId", async (req, res) => {
  try {
    const storeId = req.params.storeId;
    const cache = req.app.locals.cache;
    // Check if menu data is cached for this store
    const cachedMenu = cache.get("menuByStore" + storeId);
    if (cachedMenu && cachedMenu != undefined) {
      const deserializedMenu = JSON.parse(cachedMenu);
      console.log('menu by store served from cache');
      return res.json(deserializedMenu);
    }

    // Fetch menu data from the database
    const menu = await Menu.findOne({ store: storeId })
      .populate({
        path: "categorys",
      })
      .exec();

    // Serialize menu data
    const serializedMenu = JSON.stringify(menu);

    // Set caching headers for the response (cache for 1 hour)
    // res.setHeader('Cache-Control', 'public, max-age=86400');

    // Cache the serialized menu data
    cache.set("menuByStore" + storeId, serializedMenu);

    // Send response with menu data
    res.json(menu);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ba3teli
//get product ByStore
router.get("/productByStore/:storeId", async (req, res) => {
  const storeId = req.params.storeId;
  const cache = req.app.locals.cache;
  try {
    console.time("productByStoreQuery"); // Start the timer
    // Check if products are cached for this store
    // const cachedProducts = cache.get("productByStore" + storeId);
    // if (cachedProducts) {
    //   const deserializedProducts = JSON.parse(cachedProducts);
    //   console.log('product ByStore served from cache');
    //   return res.json(deserializedProducts);
    // }
    const products = await Product.find({ storeId })
      .populate({
        path: "size.optionGroups",
        populate: {
          path: "options.subOptionGroup",
        },
      })
      .populate({
        path: "optionGroups",
        populate: {
          path: "options.subOptionGroup",
        },
      });
    console.timeEnd("productByStoreQuery"); // End the timer and log the elapsed time
    if (!products || products.length === 0) {
      return res.status(404).json({ message: "No products found for this store" });
    }
    console.log(products)
    // Cache the products for future requests
    // const serializedProducts = JSON.stringify(products);
    // cache.set("productByStore" + storeId, serializedProducts);
    return res.status(200).json(products);
  } catch (err) {
    console.error("Error fetching product details:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});
//get category ByStore
router.get("/categoryByStore/:id", async (req, res) => {
  const id = req.params.id;

  // Validate if the 'id' is a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid ObjectId" });
  }

  // Use the valid 'id' in your query
  try {
    const category = await Category.find({ store: id });
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }
    res.json(category);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});
//get product By Category
router.get("/productByCategory/:categoryId", async (req, res) => {
  const categoryId = req.params.categoryId;

  if (!categoryId) {
    return res.status(400).json({
      message: "category ID Not found .",
    });
  }
  const product = await Product.find({ category: categoryId }).populate({
    path: "size.optionGroups",
  });

  if (!product) {
    return res.status(404).json({
      message: "Product not found.",
    });
  }

  return res.json(product);
});

//get mode by id
// const modeCache = new NodeCache();

router.get("/modeById/:id", async (req, res) => {
  const id = req.params.id;
  const cache = req.app.locals.cache;
  try {
    // const cachedMode = cache.get("modeById" + id);
    // if (cachedMode) {
    //   const deserializedMode = JSON.parse(cachedMode);
    //   return res.json(deserializedMode);
    // }
    const mode = await ConsumationMode.findById(id);
    if (!mode) {
      return res.status(404).json({ error: "mode not found" });
    }
    // const serializedMode = JSON.stringify({ mode });
    // res.setHeader('Cache-Control', 'public, max-age=86400');
    // cache.set("modeById" + id, serializedMode, 86400);
    res.json({ mode });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


//get orders history
router.post("/ordershistory", checkClient, async (req, res) => {
  try {
    const { userId, storeId } = req.body
    console.log(userId, storeId);

    const getStore = await Store.findOne({ _id: storeId })

    if (!getStore) {
      return res.status(404).json({
        message: "Store not found",
      })
    }

    const orderHistory = await order.find({ userId: userId, storeId: storeId }).sort({ _id: -1 }).populate({
      path: 'promo.promoId',
      model: 'Promo'
    }).exec()


    res.status(200).json({
      message: "orders history does got successfully.",
      data: orderHistory
    })

  } catch (error) {
    res.status(500).json({ message: error?.message });
  }
});

//api to reorder
router.post("/reorder/:orderId", checkClient, async (req, res) => {
  try {
    const userId = req.user.id;
    const orderId = req.params.orderId;

    const originalOrder = await order.findOne({ _id: orderId, userId: userId });

    if (!originalOrder) {
      return res.status(404).json({ error: "Original order not found." });
    }

    const newOrder = new order({
      userId,
      orders: originalOrder.orders,
    });

    await newOrder.save();

    res.status(201).json(newOrder);
  } catch (error) {
    console.error("Error creating reorder:", error);
    res.status(500).json({ error: "Failed to create reorder." });
  }
});

//create company
router.post("/createCompany", async (req, res) => {
  try {
    const name = req.body.name;
    const company = new Company({
      name: name,
    });
    await company.save();

    res.status(201).json({ message: "Company crÃ©Ã© avec succÃ¨s", company });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Une erreur est survenue lors de la crÃ©ation du company",
    });
  }
});
//get user information by email
router.get("/userInformation/:email", async (req, res) => {
  try {
    const email = req.params.email;
    console.log(email);
    const userInformation = await User.findOne({ email });
    res.status(201).json({ userInformation });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Une erreur est survenue lors de get user information ",
    });
  }
});

router.get("/stores/:storeId/colors", async (req, res) => {
  const storeId = req.params.storeId;
  try {
    //const storeId = req.params.storeId;
    // console.log("Requested storeId:", storeId);
    const store = await Store.findById(storeId);
    // console.log("Retrieved store:", store);
    if (!store) {
      return res.status(404).json({ error: "Store not found" });
    }
    res.status(200).json({
      primairecolor: store.primairecolor,
      secondairecolor: store.secondairecolor,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
//storebyMode
router.get("/storeByMode/:modeId", async (req, res) => {
  try {
    const modeId = req.params.modeId;

    // Find stores that have the specified consumationMode enabled
    const stores = await Store.find({
      "consumationModes.mode": modeId,
      "consumationModes.enabled": true,
    }).populate("consumationModes.mode");

    res.json({ stores });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//mode conso store
router.get("/modeConsomation/:storeid", async (req, res) => {
  const id = req.params.storeid;
  try {
    const store = await Store.findById(id).populate("consumationModes.mode");
    if (!store) {
      return res.status(404).json({ error: "Store not found" });
    }

    // Extract consumationModes from the store
    const consumationModes = store.consumationModes;

    res.json({ consumationModes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// product by store by mode
// router.get("/products-by-store/:storeId/:modeId", async (req, res) => {
//   const cache = req.app.locals.cache;
//   try {
//     const storeId = req.params.storeId;
//     const modeId = req.params.modeId;

//     // Check if products are cached for this store
//     const cachedProducts = cache.get("products-by-store" + storeId + modeId);

//     // if (cachedProducts && cachedProducts!=undefined) {
//     //   const deserializedProducts = JSON.parse(cachedProducts);
//     //   console.log('product by store by mode served from cache');
//     //   return res.json(deserializedProducts);
//     // }
//     const products = await Product.find({ storeId: storeId })
//       .populate([
//         {
//           path: "size.optionGroups",
//           populate: [
//             {
//               path: "options.subOptionGroup",
//               populate: {
//                 path: "options.option",
//               },
//             },
//             { path: "options.option" },
//           ],
//         },
//         {
//           path: "optionGroups",
//           populate: [
//             {
//               path: "options.subOptionGroup",
//               populate: {
//                 path: "options.option",
//               },
//             },
//             { path: "options.option" },
//           ],
//         },
//         {
//           path: "taxes",
//           populate: {
//             path: "tax",
//           },
//           match: { mode: modeId },
//           select: "mode",
//         },
//         {
//           path: "availabilitys",
//           match: { mode: modeId },
//           select: "mode",
//         },
//       ])
//       .exec();
//     // Filter products based on the specified mode ID
//     const filteredProducts = products.map((product) => {
//       const {
//         _id,
//         name,
//         description,
//         availability,
//         availabilitys,
//         size,
//         optionGroups,
//         storeId,
//         category,
//         price,
//         image,
//         taxes,
//       } = product;
//       return {
//         _id,
//         name,
//         description,
//         availability,
//         availabilitys: availabilitys.filter(
//           (avail) => avail.mode.toString() === modeId
//         ),
//         size,
//         optionGroups,
//         storeId,
//         category,
//         price,
//         image,
//         taxes: taxes.filter((tax) => tax.mode?.toString() === modeId),
//       };
//     });
//     const serializedProducts = JSON.stringify(filteredProducts);

//     cache.set("products-by-store" + storeId + modeId, serializedProducts);

//     return res.status(200).json(filteredProducts);

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

router.get("/products-by-store/:storeId/:modeId", async (req, res) => {
  const cache = req.app.locals.cache;
  try {
    const storeId = req.params.storeId;
    const modeId = req.params.modeId;
    // Check if products are cached for this store
    const cachedProducts = cache.get("products-by-store" + storeId + modeId);
     if (cachedProducts && cachedProducts!=undefined) {
       const deserializedProducts = JSON.parse(cachedProducts);
       console.log('product by store by mode served from cache');
       return res.json(deserializedProducts);
     }
    const products = await Product.find({ storeId: storeId })
    .populate([
      {
        path: "size.optionGroups",
        populate: [
          {
            path: "options.subOptionGroup",
            populate: {
              path: "options.option",
            },
          },
          { path: "options.option" },
        ],
      },
      {
        path: "optionGroups",
        populate: [
          {
            path: "options.subOptionGroup",
            populate: {
              path: "options.option",
              populate:[
                {
                  path: "taxes",
                  match: { mode: modeId },
                  select: "mode",
                  populate: {
                    path: "tax",
                  },
                },
              ]
            },
          },
          { path: "options.option" ,
              populate:[
                {
                  path: "taxes",
                  match: { mode: modeId },
                  select: "mode",
                  populate: {
                    path: "tax",
                  },
                },
              ]
          },
          {
            path: "options.taxes",
            match: { mode: modeId },
            select: "mode",
            populate: {
              path: "tax",
            },
          },
        ],
      },
      {
        path: "taxes",
        match: { mode: modeId },
        select: "mode",
        populate: {
          path: "tax",
        },
      },
      {
        path: "availabilitys",
        match: { mode: modeId },
        select: "mode",
      },
    ])
    .exec();
    // Filter products based on the specified mode ID
    const test = [...products];
    const filteredProducts = products.map((product,i) => {
      product.optionGroups.map((option,j) => {
        option.options.map((option2,k) => {
          option2.option.taxes.map((option3) => {
            if (option3.mode.toString() == modeId) {
              test[i].optionGroups[j].options[k].option.tax =   option3.tax.rate;
              test[i].optionGroups[j].options[k].option.id_tax = option3.tax._id.toString();
            }
          })
          option2.subOptionGroup.map((option4,l) => {
            option4.options.map((option5,m) => {
  
                option5.option.taxes.map((option6) => {
                  if (option6.mode.toString() == modeId) {
                   
                    test[i].optionGroups[j].options[k].subOptionGroup[l].options[m].option.tax    =  option6.tax.rate;
                    test[i].optionGroups[j].options[k].subOptionGroup[l].options[m].option.id_tax =  option6.tax._id.toString();
                  }
               
                })




            })
           
          })
          
        })
      })
      const {
        _id,
        name,
        description,
        availability,
        availabilitys,
        size,
        optionGroups,
        storeId,
        category,
        price,
        image,
        taxes,
      } = product;
      return {
        _id,
        name,
        description,
        availability,
        availabilitys: availabilitys.filter(
          (avail) => avail.mode.toString() === modeId
        ),
        size,
        optionGroups : test[i].optionGroups,
        storeId,
        category,
        price,
        image,
        taxes: taxes.filter((tax) => tax.mode?.toString() === modeId),
      };
    });
    const serializedProducts = JSON.stringify(filteredProducts);
    cache.set("products-by-store" + storeId + modeId, serializedProducts);
    return res.status(200).json(filteredProducts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});



// router.get("/products-by-store/:storeId/:modeId", async (req, res) => {
//   const cache = req.app.locals.cache;
//   try {
//     const storeId = req.params.storeId;
//     const modeId = req.params.modeId;

//     // Check if products are cached for this store
//     const cachedProducts = cache.get("products-by-store" + storeId + modeId);

//     if (cachedProducts && cachedProducts!=undefined) {
//       const deserializedProducts = JSON.parse(cachedProducts);
//       console.log('product by store by mode served from cache');
//       return res.json(deserializedProducts);
//     }
//     const products = await Product.find({ storeId: storeId })
//       .populate([
//         {
//           path: "size.optionGroups",
//           populate: [
//             {
//               path: "options.subOptionGroup",
//               populate: {
//                 path: "options.option",
//               },
//             },
//             { path: "options.option" },
//           ],
//         },
//         {
//           path: "optionGroups",
//           populate: [
//             {
//               path: "options.subOptionGroup",
//               populate: {
//                 path: "options.option",
//               },
//             },
//             {
//               path: "options.option"
//             },
//             {
//               path: "options.taxes",
//               populate: {
//                 path: "tax",
//               },
//               match: { mode: modeId },
//               select: "mode",
//             }
//           ],
//         },
//            {
//           path: "taxes",
//           populate: {
//             path: "tax",
//           },
//           match: { mode: modeId },
//           select: "mode",
//         },
//         {
//           path: "availabilitys",
//           match: { mode: modeId },
//           select: "mode",
//         },
//       ])
//       .exec();




//     // Filter products based on the specified mode ID
//     const test = [...products];
  
//     const filteredProducts = products.map((product,i) => {

    
//       product.optionGroups.map((option,j) => {
     
//         option.options.map((option2,k) => {

         


//           option2.option.taxes.map((option3) => {
            
//            console.log("wess",option3)
//             if (option3.mode.toString() == modeId) {
       
//               const tx =  await Tax.findOne({ _id: option3.tax._id.toString()});
//               console.log("------------------")
//               console.log("tx",tx)
//               console.log("------------------")
//               test[i].optionGroups[j].options[k].option.tax = tx.rate;
//               test[i].optionGroups[j].options[k].option.id_tax = option3.tax._id.toString();
           
//             }

//           })


//         })



//       })

//       const {
//         _id,
//         name,
//         description,
//         availability,
//         availabilitys,
//         size,
//         optionGroups,
//         storeId,
//         category,
//         price,
//         image,
//         taxes,
//       } = product;


//       return {
//         _id,
//         name,
//         description,
//         availability,
//         availabilitys: availabilitys.filter(
//           (avail) => avail.mode.toString() === modeId
//         ),
//         size,
//         optionGroups : test[i].optionGroups,
//         storeId,
//         category,
//         price,
//         image,

//         taxes: taxes.filter((tax) => tax.mode?.toString() === modeId),
//       };
//     });




//     const serializedProducts = JSON.stringify(filteredProducts);

//     cache.set("products-by-store" + storeId + modeId, serializedProducts);

//     return res.status(200).json(filteredProducts);

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });
// router.get("/products-by-store/:storeId/:modeId", async (req, res) => {
//   const cache = req.app.locals.cache;
//   try {
//     const storeId = req.params.storeId;
//     const modeId = req.params.modeId;

//     // Check if products are cached for this store
//     const cachedProducts = cache.get("products-by-store" + storeId + modeId);

//     // if (cachedProducts && cachedProducts != undefined) {
//     //   const deserializedProducts = JSON.parse(cachedProducts);
//     //   console.log('product by store by mode served from cache');
//     //   return res.json(deserializedProducts);
//     // }

//     const products = await Product.find({ storeId: storeId })
//       .populate([
//         {
//           path: "size.optionGroups",
//           populate: [
//             {
//               path: "options.subOptionGroup",
//               populate: {
//                 path: "options.option",
//               },
//             },
//             { path: "options.option" },
//           ],
//         },
//         {
//           path: "optionGroups",
//           populate: [
//             {
//               path: "options.subOptionGroup",
//               populate: {
//                 path: "options.option",
//               },
//             },
//             { path: "options.option" },
//             {
//               path: "options.taxes",
//               populate: {
//                 path: "tax",
//               },
//               match: { mode: modeId },
//               select: "mode",
//             },
//           ],
//         },
//         {
//           path: "taxes",
//           populate: {
//             path: "tax",
//           },
//           match: { mode: modeId },
//           select: "mode",
//         },
//         {
//           path: "availabilitys",
//           match: { mode: modeId },
//           select: "mode",
//         },
//       ])
//       .exec();

//     // Filter products based on the specified mode ID
//     const filteredProducts = [];

//     for (const product of products) {
//       const serializedProduct = { ...product._doc };

//       for (const optionGroup of serializedProduct.optionGroups) {
//         for (const option of optionGroup.options) {
//           for (const option3 of option.option.taxes) {
//             if (option3.mode.toString() === modeId) {
//               const tx = await Tax.findOne({ _id: option3.tax._id.toString() });
//               option.option.tax = tx.rate;
//               option.option.id_tax = option3.tax._id.toString();
//             }
//           }
//         }
//       }

//       // Customize the product object as needed
//       const filteredProduct = {
//         _id: serializedProduct._id,
//         name: serializedProduct.name,
//         description: serializedProduct.description,
//         availability: serializedProduct.availability,
//         availabilitys: serializedProduct.availabilitys.filter((avail) => avail.mode.toString() === modeId),
//         size: serializedProduct.size,
//         optionGroups: serializedProduct.optionGroups,
//         storeId: serializedProduct.storeId,
//         category: serializedProduct.category,
//         price: serializedProduct.price,
//         image: serializedProduct.image,
//         taxes: serializedProduct.taxes.filter((tax) => tax.mode?.toString() === modeId),
//       };

//       filteredProducts.push(filteredProduct);
//     }

//     const serializedProducts = JSON.stringify(filteredProducts);

//     cache.set("products-by-store" + storeId + modeId, serializedProducts);

//     return res.status(200).json(filteredProducts);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

//promo by store by mode
// const promosCache = new NodeCache(); // Initialize cache for promos data

router.get("/promos-by-store/:storeId/:modeId", async (req, res) => {
  const cache = req.app.locals.cache;
  try {
    const storeId = req.params.storeId;
    const modeId = req.params.modeId;

    // Check if promos data is cached for this store and mode
    const cachedPromos = cache.get("promos-by-store" + storeId + modeId);
    if (cachedPromos && cachedPromos != undefined) {
      const deserializedPromos = JSON.parse(cachedPromos);
      console.log('promo by store by mode served from cache');
      return res.json(deserializedPromos);
    }

    // Fetch promos data from the database
    const promos = await Promo.find({ storeId: storeId })
      .populate({
        path: "promos.products",
        model: "Product",
        populate: [
          {
            path: "size.optionGroups",
            populate: [
              {
                path: "options.subOptionGroup",
                populate: {
                  path: "options.option",
                },
              },
              { path: "options.option" },
            ],
          },
          {
            path: "optionGroups",
            populate: [
              {
                path: "options.subOptionGroup",
                populate: {
                  path: "options.option",
                },
              },
              { path: "options.option" },
            ],
          },
          {
            path: "taxes",
            populate: {
              path: "tax",
            },
            match: { mode: modeId },
            select: "mode",
          },
        ],
      })
      .populate({
        path: "promos.category",
        model: "Category",
      })
      .exec();

    // Filter promos based on the specified mode ID in availabilitys
    const filteredPromos = promos.map((promo) => {
      const {
        _id,
        name,
        numberGroup,
        number2,
        image,
        promos,
        category,
        order,
        discount,
        availability,
        availabilitys,
      } = promo;

      // Check if availabilitys is defined before filtering
      const filteredAvailabilitys = availabilitys.filter(
        (avail) => avail.mode.toString() === modeId
      );

      // Return promo object only if filteredAvailabilitys has items
      return filteredAvailabilitys.length > 0
        ? {
          _id,
          name,
          numberGroup,
          number2,
          image,
          promos,
          category,
          order,
          discount,
          availability,
          availabilitys: filteredAvailabilitys,
        }
        : null;
    }).filter(Boolean); // Filter out null values

    // Serialize promos data
    const serializedPromos = JSON.stringify({
      message: "Promos retrieved successfully.",
      promos: filteredPromos,
    });

    // Set caching headers for the response (cache for 1 hour)
    // res.setHeader('Cache-Control', 'public, max-age=86400');

    // Cache the serialized promos data
    cache.set("promos-by-store" + storeId + modeId, serializedPromos);

    // Send response with promos data
    res.json({
      message: "Promos retrieved successfully.",
      promos: filteredPromos,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


router.post("/transfer-funds", async (req, res) => {
  try {
    const { amount, paymentMethodId, connectedAccountId } = req.body;
    // Create a PaymentIntent to charge the customer
    const paymentIntent = await stripe.paymentIntents.create({
      amount: parseFloat(amount * 100).toFixed(0),
      currency: "eur",
      payment_method: paymentMethodId,
      confirm: true,
      confirmation_method: "manual",
      description: "Payment for meals",
      application_fee_amount: 0,
      transfer_data: {
        destination: connectedAccountId,
      },
      return_url: "http://localhost:3000", // Specif    y your return URL here
    });
    res.json({ paymentIntentId: paymentIntent.id });
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to transfer funds");
  }
});

router.put("/managefavorites", async (req, res) => {
  try {
    const response = await order.findOneAndUpdate(
      { _id: req.body.orderId, userId: req.body.userId }, { favorite: req.body.favorite }, { new: true }
    );
    if (!response) {
      return res.status(200).json({
        message: "Order not found."
      })
    }

    const orders = await order.find(
      { favorite: true, userId: req.body.userId }
    ).sort({ _id: -1 }).populate({
      path: 'promo.promoId',
      model: 'Promo'
    }).exec()

    return res.status(200).json({
      orders,
      message: "Orders does updated and favorites orders does got successfully."
    })
  } catch (err) {
    return res.status(500).json({
      message: err?.message
    });
  }
});

router.get("/getfavoritesorders/:userId", async (req, res) => {
  try {
    const response = await order.find(
      { favorite: true, userId: req.params.userId }
    ).sort({ _id: -1 }).populate({
      path: 'promo.promoId',
      model: 'Promo'
    }).exec()
    if (!response) {
      return res.status(200).json({
        message: "Order not found."
      })
    }
    return res.status(200).json({
      orders: response,
      message: "Favorites orders does got successfully."
    })
  } catch (err) {
    return res.status(500).json({
      message: err?.message
    });
  }
});

router.get('/specialites', async (req, res) => {

  try {
    const cache = req.app.locals.cache;
    // Check if products are cached for this store
    const specialites1 = cache.get("specialites");

    if (specialites1 && specialites1 != undefined) {
      const deserializedspecialites = JSON.parse(specialites1);
      console.log('specialites  served from cache');
      return res.json(deserializedspecialites);
    }
    const specialites = await Specialite.find({});

    const serializedspecialites = JSON.stringify(specialites);

    cache.set("specialites", serializedspecialites);
    res.status(200).json(specialites);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.get('/stores-specialites/:specialtyId', async (req, res) => {
  try {
    const specialtyId = req.params.specialtyId;

    if (specialtyId === 'All_stores') {
      // Find all stores that have at least one product
      const stores = await Store.find({
        _id: { $in: await Product.distinct('storeId') }
      });
      res.json(stores);
    } else {
      // Find stores with the specified specialtyId that have at least one product
      const stores = await Store.find({
        specialites: new mongoose.Types.ObjectId(specialtyId),
        _id: { $in: await Product.distinct('storeId') }
      }).populate('specialites');
      res.json(stores);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//Delivery Adress
router.post("/AdressDelivery/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const { Nameaddress, Type, Lat, Lon, Note } = req.body;

    // Check if all required fields are provided
    if (!Nameaddress || !Type) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const decodedNameaddress = decodeURIComponent(Nameaddress);
    const NewAdress = {
      Nameaddress: decodedNameaddress,
      Type: Type,
      Lat: Lat,
      Lon: Lon,
      Note: Note,
    };

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if the new address already exists for the user
    const existingAddress = user.deliveryAdress.find(
      (address) => address.Nameaddress === decodedNameaddress && address.Type === Type
    );
    if (!existingAddress) {
      // Address doesn't exist, add it to the user's deliveryAdress array
      user.deliveryAdress.push(NewAdress);
      await user.save();
      return res.status(200).json({ message: "New address added successfully" });
    } else {
      return res.status(200).json({ message: "Address already exists for the user" });
    }
  } catch (err) {
    console.error("Error updating user data:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
//Get Delivery Adress ByUserId
router.get("/GetAdressDeliveryByUserId/:userId", async (req, res) => {
  const userId = req.params.userId;
  try {
    const user = await User.findById(userId);
    console.log(user);
    console.log("----------------");
    if (user) {
      console.log(user.deliveryAdress);
      return res.status(200).json(user.deliveryAdress);
    } else {
      return res.status(200).json({ message: "Address already exists for the user" });
    }
  } catch (err) {
    console.error("Error updating user data:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
// Delete Delivery Address By UserId, NameAddress, and Type
router.delete("/DeleteAdressDelivery/:userId/:NameAddress/:Type", async (req, res) => {
  try {
    const userId = req.params.userId;
    const NameAddress = decodeURIComponent(req.params.NameAddress);
    const Type = req.params.Type;

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if the address exists for the user
    const existingAddressIndex = user.deliveryAdress.findIndex(
      (address) => address.Nameaddress === NameAddress && address.Type === Type
    );
    if (existingAddressIndex === -1) {
      return res.status(404).json({ error: "Address not found for the user" });
    }

    // Remove the address from the user's deliveryAdress array
    user.deliveryAdress.splice(existingAddressIndex, 1);
    await user.save();

    return res.status(200).json({ message: "Address deleted successfully" });
  } catch (err) {
    console.error("Error deleting user address:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


router.post('/createquote', async (req, res) => {
  try {
    const { pickup_address, dropoff_address, external_store_id } = req.body
    const costumelID = "66d29428-580c-5ddf-9ee1-93482329f960";

    const authTokenn = req.headers.authuber;
    const url = `https://api.uber.com/v1/customers/${costumelID}/delivery_quotes`;

    const uberDirectResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': "Bearer " + authTokenn
      },
      body: JSON.stringify({
        pickup_address: pickup_address,
        dropoff_address: dropoff_address,
        external_store_id: external_store_id
      })
    });
    const uberDirectData = await uberDirectResponse.json();
    if (uberDirectResponse.ok) {
      return res.status(200).json({
        message: 'Commande created successfully',
        data: {
          pickup_duration: uberDirectData.pickup_duration
        }
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

//******* under test (houcem) **********
//Delivery Adress
router.post("/AdressDelivery/:userId/:Nameaddress/:Type", async (req, res) => {
  const userId = req.params.userId;
  const decodedNameaddress = decodeURIComponent(req.params.Nameaddress);
  // const decodedType = decodeURIComponent(req.params.Type);
  const NewAdress = {
    Nameaddress: decodedNameaddress,
    Type: req.params.Type,
  };
  try {
    const user = await User.findById(userId);
    console.log("user", user);
    // Check if the new address already exists for the user
    const existingAddress = await User.find({
      _id: userId,
      deliveryAdress: { $in: [NewAdress] }
    });
    console.log(existingAddress)
    if (existingAddress.length === 0) {
      // Address doesn't exist, add it to the user's deliveryAdress array
      user.deliveryAdress.push(NewAdress);
      await user.save();
      return res.status(200).json({ message: "New address added successfully" });
    } else {
      return res.status(200).json({ message: "Address already exists for the user" });
    }
  } catch (err) {
    console.error("Error updating user data:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
//Get Delivery Adress ByUserId
router.get("/GetAdressDeliveryByUserId/:userId", async (req, res) => {
  const userId = req.params.userId;
  try {
    const user = await User.findById(userId);
    console.log(user);
    console.log("----------------");
    if (user) {
      console.log(user.deliveryAdress);
      return res.status(200).json(user.deliveryAdress);
    } else {
      return res.status(200).json({ message: "Address already exists for the user" });
    }
  } catch (err) {
    console.error("Error updating user data:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//******* under test (houcem)  end **********

module.exports = router;

