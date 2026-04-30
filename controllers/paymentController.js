const crypto = require("crypto")
const orderModel = require("../models/orderModel")
const productModel = require("../models/productModel")
require("dotenv").config()
const razorpay = require("../config/razorpay")

const createRazorpayOrder = async (req, res) => {
    try {
        const { amount } = req.body;

        const options = {
            amount: amount * 100,
            currency: "INR",
            receipt: `receipt_${Date.now()}`
        };

        const order = await razorpay.orders.create(options)

        res.status(200).json({
            success: true,
            order
        })
    } catch (err) {
        res.status(500).json({
            message: "Error creaing Razorpay order",
            error: err.message
        })
    }
}



const verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            orderData
        } = req.body

        const body = razorpay_order_id + "|" + razorpay_payment_id

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: "Payment verification failed"
            });
        }

        const formattedItems = await Promise.all(
            orderData.items.map(async (item) => {
                const product = await productModel.findById(item.productId)

                if (!product) {
                    throw new Error("Product not found")
                }

                if (product.stock < item.quantity) {
                    throw new Error(`${product.name} out of stock`)
                }

                return {
                    productId: item.productId,
                    name: product.name,
                    price: product.price,
                    quantity: item.quantity,
                    image: product.image
                }
            })
        )

        await productModel.bulkWrite(
            orderData.items.map((item) => ({
                updateOne: {
                    filter: {
                        _id: item.productId,
                        stock: { $gte: item.quantity }
                    },
                    update: {
                        $inc: {
                            stock: -item.quantity
                        }
                    }
                }
            }))
        );


        const userId = req.user.userID

        const order = await orderModel.create({
            userId: userId,
            orderNumber: `FUT-${Date.now()}`,
            items: formattedItems,
            shippingAddress: orderData.shippingAddress,
            totalAmount: orderData.totalAmount,
            paymentMethod: "razorpay",
            paymentStatus: "paid",
            status: "pending",
            razorpay_payment_id
        });

        res.status(200).json({
            success: true,
            message: "Payment successful",
            order
        })
    } catch (err) {
        res.status(500).json({
            message: "Verification error",
            error: err.message
        })
    }
}

module.exports = { createRazorpayOrder, verifyPayment }