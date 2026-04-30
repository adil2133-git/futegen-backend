const mongoose = require("mongoose")

const orderSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    orderNumber: {
        type: String,
        required: true,
        unique: true
    },
    items: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
                required: true
            },
            name: String,
            price: Number,
            size: String,
            quantity: {
                type: Number,
                required: true,
                min: 1
            },
            image: String
        }
    ],
    shippingAddress: {
        Fname: String,
        Lname: String,
        email: String,
        phone: String,
        address: String,
        city: String,
        state: String,
        zipCode: String
    },
    totalAmount: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
        default: "pending"
    },
    paymentMethod: {
        type: String,
        default: "upi"
    },
    paymentStatus: {
        type: String,
        enum: ["pending", "paid", "failed"],
        default: "paid"
    },
    upiId: {
        type: String
    }
}, { timestamps: true })

module.exports = mongoose.model("Order", orderSchema)