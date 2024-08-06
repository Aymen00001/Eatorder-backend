const express = require("express");
const order = require("../models/order");
const schedule = require("node-schedule");

const router = express.Router();

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
        // if (data) {
        req.io.to(data.storeId.toString()).emit("receive_orders", { data: "." + JSON.stringify(data) });
        // }

        const newDate = new Date(data.createdAt.getTime() + 30 * 1000);
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
                        // sendSseToClient(
                        //     isMissed.storeId.toString(),
                        //     `Your order is ${isMissed.status}`,
                        //     null,
                        //     isMissed,
                        //     false
                        // );
                        req.io.to(isMissed.storeId.toString()).emit("receive_orders", { data: `Your order is ${isMissed.status}` })

                        req.io.to(isMissed.userId.toString()).emit("receive_orders", { data: JSON.stringify({ orderId: isMissed._id, status: isMissed.status }) })
                        // sendSseToClient(
                        //     isMissed.userId.toString(),
                        //     JSON.stringify({ orderId: isMissed._id, status: isMissed.status }),
                        //     null,
                        //     isMissed,
                        //     true
                        // );
                    }
                }
            };
            lastData();
        });

        res.status(201).json({
            date: finalDate,
            order: newOrder
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err?.message });
    }
});


router.put("/order/updatestatus", async (req, res) => {
    try {
        const { status, _id, preparationTime, updatedBy } = req.body;
        if (status && _id) {
            let data = preparationTime
                ? {
                    status,
                    updatedAt: Date.now(),
                    preparedAt: new Date(Date.now() + preparationTime * 60000),
                    updatedBy: updatedBy
                }
                : { status, updatedAt: Date.now(),updatedBy: updatedBy };
            const updateStatus = await order.findOneAndUpdate({ _id: _id }, data, {
                new: true,
            });
            if (!updateStatus) {
                return res.status(404).json({
                    message: "Order not found.",
                });
            }
            req.io.to(updateStatus.userId.toString()).emit("receive_orders", { data: JSON.stringify({ orderId: updateStatus._id, status: updateStatus.status }) })

            req.io.to(updateStatus.storeId.toString()).emit("receive_orders", { data: `${JSON.stringify(updateStatus)}` })


            // sendSseToClient(
            //     updateStatus.userId.toString(),
            //     JSON.stringify({ orderId: updateStatus._id, status: updateStatus.status }),
            //     null,
            //     updateStatus,
            //     true
            // );

            // sendSseToClient(
            //     updateStatus.storeId.toString(),
            //     `${JSON.stringify(updateStatus)}`,
            //     req.params.idFront,
            //     updateStatus,
            //     false
            // );
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

module.exports = router;
