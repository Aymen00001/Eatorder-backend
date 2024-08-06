const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const Store = require("../models/store.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../config.js");
const {
    checkSuperAdmin,
    checkOwner,
    checkManager,
} = require("../middlewares/authMiddleware.js");
const GroupeOption = require("../models/optionGroupe.js");
const multer = require("multer");
const path = require("path");
const Option = require("../models/productOption.js");
const Product = require("../models/product.js");
const Category = require("../models/category.js");
const mongoose = require("mongoose");
const Tax = require("../models/tax.js");
const fs = require("fs");
const fsPromises = require("fs/promises");
const ConsumationMode = require("../models/mode");
const Order = require("../models/order.js");
const order = require("../models/order.js");
const store = require("../models/store.js");
const Menu = require("../models/menu.js");
const schedule = require("node-schedule");
const { sendOrderStatusEmail } = require('../emailService.js');
const Notification = require("../models/notification.js");


let clients = [];
// Utility function to send SSE to a specific client
function sendSseToClient(clientId, message, idFront, order, isClient) {
    const client = clients.find((c) => c.clientId === clientId);
    console.log(isClient);
    if (isClient.toString() === "true") {
        sendOrderStatusEmail(order);
    }

    if (client) {
        for (let i = 0; i < clients.length; i++) {
            if (clients[i].clientId === clientId && idFront !== clients[i].idFront) {
                clients[i].res.write(`data: ${message}\n\n`);
                console.log(clients[i].clientId);

            }
        }
    }
}

// Server-Sent Events endpoint
router.get("/sse/:clientId/:idFront", (req, res) => {
    const clientId = req.params.clientId;
    const idFront = req.params.idFront;
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    // Save the client response object for future notifications
    console.log("clients : ", clients.length);
    const client = clients.find(
        (c) => c.clientId === clientId && idFront === c.idFront
    );
    if (client) {
        client.res = res;
    } else {
        clients.push({ clientId, res, idFront });
        res.write(`data: Welcome \n\n`);
        console.log(clients.length);
    }

    req.on("close", () => {
        console.log("SSE connection closed");
        const index = clients.findIndex(
            (c) => c.clientId === clientId && c.idFront === idFront
        );

        if (index !== -1) {
            clients.splice(index, 1);
            console.log(`Removed client: ${clientId}, ${idFront}`);
        }
    });
});


router.post("/orders", async (req, res) => {
    console.log(req.body);
    try {
        const items = req.body;
        const newOrder = await new order(items);
        const validationError = newOrder.validateSync();
        if (validationError) {
            return res.status(400).json({ error: validationError.message });
        }
        const data = await newOrder.save();
        console.log("---------------data------------");
        console.log(data);
        console.log("---------------data------------");
        

        if (data) {
            sendSseToClient(
                data.storeId.toString(),"." + JSON.stringify(data) , null, data, true
                // "New order received"
            );
        }
        const newDate = new Date(data.createdAt.getTime() + 90 * 1000);
        const formattedDate = newDate
            .toISOString()
            .replace(/\.(\d{3})Z$/, ".$1+00:00");
        const finalDate = new Date(formattedDate);

        const job = schedule.scheduleJob(finalDate, function () {
            const lastData = async () => {
                const lastOrder = await order.findOne({ _id: data._id });
                if (lastOrder.status === "pending") {
                    const isMissed = await order.findOneAndUpdate(
                        { _id: data._id },
                        { status: "missed", updatedAt: Date.now() },
                        { new: true }
                    );
                    if (isMissed) {
                        sendSseToClient(
                            isMissed.storeId.toString(),
                            `Your order is ${isMissed.status}`,
                            null,
                            isMissed,
                            false
                        );
                        sendSseToClient(
                            isMissed.userId.toString(),
                            JSON.stringify({ orderId: isMissed._id, status: isMissed.status }),
                            null,
                            isMissed,
                            true
                        );
                    }
                }
            };
            lastData();
        });
        res.status(201).json({
            date : finalDate,
            order : newOrder
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err?.message });
    }
});

// update status of order by id (from restaurant's owner)
router.put("/order/updatestatus/:idFront", async (req, res) => {
    try {
        const { status, _id, preparationTime } = req.body;
        if (status && _id) {
            let data = preparationTime
                ? {
                    status,
                    updatedAt: Date.now(),
                    preparedAt: new Date(Date.now() + preparationTime * 60000),
                }
                : { status, updatedAt: Date.now() };
            const updateStatus = await order.findOneAndUpdate({ _id: _id }, data, {
                new: true,
            });
            if (!updateStatus) {
                return res.status(404).json({
                    message: "Order not found.",
                });
            }
            sendSseToClient(
                updateStatus.userId.toString(),
                JSON.stringify({ orderId: updateStatus._id, status: updateStatus.status }),
                null,
                updateStatus,
                true
            );

            sendSseToClient(
                updateStatus.storeId.toString(),
                `${JSON.stringify(updateStatus)}`,
                req.params.idFront,
                updateStatus,
                false
            );
            return res.status(200).json({
                message: "Status does update successfully.",
                order: updateStatus,
            });
        }
        return res.status(400).json({
            message: "No data found. Failed to update order's status.",
        });
    } catch (err) {
        return res.status(500).json({
            message: err?.message,
        });
    }
});

/*************************************/
/*post*/
router.post("/notifications/:orderid/:status/:userid", async (req, res) => {
    const { orderid, status, userid } = req.params;

    try {
        // Check if the Notification model exists
        if (!Notification) {
            return res.status(500).json({ error: "Notification model is not defined." });
        }

        const notificationInstance = new Notification({
            orderid,
            message: status,
            clientId: userid,
            read: false,
            date: new Date()
        });

        const notification = await notificationInstance.save();
        res.status(201).json({ message: "Notification created!", notification });
    } catch (error) {
        console.error("Error saving notification:", error);
        res.status(500).json({ error: "An error occurred while saving the notification." });
    }
});
  /*get*/
  
router.get("/notifications/:clientid", async (req, res) => {
    try {
        const clientId = req.params.clientid;

        // Find and sort notifications for the specified clientId by date in descending order
        const notifications = await Notification.find({ clientId })
            .sort({ date: -1 }) // Sort by date in descending order
            

        if (notifications.length === 0) {
            return res.status(404).json({ message: "No notifications found for the specified client." });
        }

        res.status(200).json(notifications);
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({ error: "An error occurred while fetching notifications." });
    }
});

  
 /************************************/ 
 /*puut*/
router.put("/notifications/:orderid/:status/:userid", async (req, res) => {
    try {
        // Input validation
        const { orderid, status, userid } = req.params;
        if (!orderid || !status || !userid) {
            return res.status(400).json({ error: "Missing required parameters." });
        }

        // Find and update notification
        const filter = { orderid, clientId: userid }; // Criteria to find notification
        const update = {
            message: status,
            read: false,
            date: new Date(),
            dateRead: new Date()
        };

        // Execute the update operation
        const notification = await Notification.findOneAndUpdate(filter, update, {
            new: true, // Return the modified document
            upsert: true // Create the document if it doesn't exist
        });

        const notifications = await Notification.find({clientId:userid}).sort({ date: -1 });
        // Respond with success message and updated notification
        res.status(200).json({ message: "Notification updated!", notification : notifications });
    } catch (error) {
        console.error("Error updating notification:", error);
        res.status(500).json({ error: "An error occurred while updating the notification." });
    }
});


/************************************/
//put
/************************************/
  router.put("/notifications/:orderId/:clientId", (req, res) => {
    const clientId = req.params.clientId;
    const orderid = req.params.orderId;
    Notification.findOneAndUpdate(
        { clientId, orderid },
        { $set: { read: true, dateRead: new Date() } },   
        { new: true }     
    )
    .then((notification) => {
        if (!notification) {
            return res.status(404).json({ message: "No notification found for the specified client and order." });
        }
        res.status(200).json({ message: "Notification updated successfully.", notification });
    })
    .catch((error) => {
        console.error("Error updating notification:", error);
        res.status(500).json({ error: "An error occurred while updating the notification." });
    });
});






  
// Route to delete notifications of a client by their ID
router.delete("/notifications/:clientId", async (req, res) => {
    try {
      // Fetch all notifications for the given client
      const notifications = await Notification.find({ clientId: req.params.clientId });
  
      // Filter notifications to find those older than 2 days based on their 'date' field
      const idsToDelete = notifications.filter(notification => {
        const notificationDate = new Date(notification.date);
        const twoDaysAfterNotification = new Date(notificationDate);
        twoDaysAfterNotification.setDate(notificationDate.getDate() + 2);
        return new Date() > twoDaysAfterNotification;
      }).map(notification => notification._id);
  
      // Delete the filtered notifications
      const deletedNotifications = await Notification.deleteMany({ _id: { $in: idsToDelete } });
  
      // Log the result to the console
      console.log(deletedNotifications);
  
      // Send a success response with the details of the deleted notifications
      res.status(200).json({ message: "Notifications deleted!", deletedNotifications });
    } catch (error) {
      // Log the error and send a 500 response with an error message
      console.error("Error deleting notifications:", error);
      res.status(500).json({ error: "An error occurred while deleting the notifications." });
    }
  });
/************************************/

module.exports = router;
