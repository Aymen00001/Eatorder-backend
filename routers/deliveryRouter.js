const express = require("express");
const router = express.Router();
const DeliveryStatus = require("../models/DeliveryStatus.js");

router.post("/webhook", async (req, res) => {
    try {
        // const deliverystatus = new DeliveryStatus(req.body)
        // await deliverystatus.save()
        
        if(req.body.status!=="pending"){
            req.io.to(req.body.delivery_id).emit("receive_data", { data : {status : req.body.status,delivery_id :req.body.delivery_id } });
        }
        res.status(200).json({ message: "Data sent successfully" });
    } catch (error) {
        res.status(500).json({ message: error?.message });
    }
});

module.exports = router;
