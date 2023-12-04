
const User= require('../models/users');
const Razorpay = require('razorpay');
const key_id = process.env.RAZORPAY_KEY_ID;
const key_secret = process.env.RAZORPAY_KEY_SECRET;
exports.premiummembership = async (request, response, next) => {
    try {
        const rzpintance = new Razorpay({
            key_id: key_id,
            key_secret: key_secret
        })
        var options = {
            amount: 50000,
            currency: "INR",
        };
        const orderDetails = await rzpintance.orders.create(options);
        const {userId }= request;
        const { id, status } = orderDetails;
        const user = await  User.fetchById(userId)
        await User.createOrder(userId,{
            order_id: id,
            status: status,
        });
        response.status(200).json({ key_id: key_id, orderid: id, user: user });

    } catch (error) {
        console.log(error);
    }
}
exports.updatetransactionstatus = async (request, response, next) => {
    const { order_id, payment_id } = request.body;

    try {
        const {userId }= request;
        const user = await  User.fetchById(userId);
        const {order} = user;
        user.ispremiumuser = true;
        order.payment_id = payment_id;
        order.status = "Successfull";
        order.createdAt = new Date();
        await User.updateOrder(userId,order)
        response.status(202).json({ success: true, message: "Thank youfor being a premium user" });
    } catch (error) {
        console.log(error);
        response.status(500).json({ success: false, message: "Error updating transaction" });
    }
}