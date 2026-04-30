const orderModel = require("../models/orderModel")

const createOrder = async (req, res) => {
    try {
        const userId = req.user.userID
        const { items, shippingAddress, totalAmount, paymentMethod } = req.body

        if (!items || items.length === 0) {
            return res.status(400).json({ message: "No items in order" })
        }

        const orderNumber = `FUT-${Date.now()}`

        const productModel = require("../models/productModel")

        const formattedItems = await Promise.all(
            items.map(async (item) => {
                const product = await productModel.findById(item.productId)
                console.log("Before:", product.stock)
                if (!product) {
                    throw new Error("Product not found")
                }

                if (product.stock < item.quantity) {
                    return res.status(400).json({
                        success: false,
                        message: `${product.name} is out of stock`
                    })
                }

                product.stock -= item.quantity
                await product.save()
                console.log("After:", product.stock)

                return {
                    productId: item.productId,
                    name: product.name,
                    price: product.price,
                    quantity: item.quantity,
                    image: product.image
                }
            })
        )

        const order = await orderModel.create({
            userId,
            orderNumber,
            items: formattedItems,
            shippingAddress,
            totalAmount,
            paymentMethod: "cod",
            paymentStatus: "pending",
            status: "pending"
        })

        res.status(201).json({
            success: true,
            message: "COD order placed",
            data: order
        })
    } catch (err) {
        res.status(500).json({
            message: "Error creating order",
            error: err.message
        })
    }
}

const getUserOrders = async (req, res) => {
    try {
        const userId = req.user.userID

        const { status, sort } = req.query

        let filter = { userId }

        if (status && status !== "all") {
            filter.status = status
        }

        let sortOption = {}

        if (sort === "oldest") {
            sortOption = { createdAt: 1 }
        } else {
            sortOption = { createdAt: -1 }
        }

        const orders = await orderModel
            .find(filter)
            .sort(sortOption)
            .lean()

        res.status(200).json({
            success: true,
            data: orders
        })
    } catch (err) {
        res.status(500).json({
            message: "Error fetching orders",
            error: err.message
        })
    }
}

module.exports = { createOrder, getUserOrders }