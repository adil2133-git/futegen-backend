const cartModel = require("../models/cartModel")
const productModel = require("../models/productModel")

const getCartItems = async (req, res) => {
    try {
        let userID = req.user.userID;


        const cartData = await cartModel
            .findOne({ userId: userID })
            .populate("products.productId")

        if (!cartData) {
            return res
                .status(200)
                .json({ success: true, message: "Cart is Empty", data: { products: [] } })
        }

        const validProducts = cartData.products.filter(item => {
            return item.productId && item.productId.stock > 0
        })

        if (validProducts.length !== cartData.products.length) {
            cartData.products = validProducts
            await cartData.save()
        }

        res.status(200).json({ success: true, message: "Cart fetched successfully", data: cartData })
    } catch (err) {
        res
            .status(500)
            .json({ message: "Get Cart Items system Error", Error: err.message })
    }
}


const addToCart = async (req, res) => {
    try {
        let userId = req.user.userID
        let productId = req.params.id
        const { size } = req.body

        if (!size) {
            return res.status(400).json({ message: "Size is required" })
        }

        const product = await productModel.findById(productId)

        if (!product || product.stock === 0) {
            return res.status(400).json({ message: "Product out of stock" })
        }

        const cartItem = await cartModel.findOne({
            userId,
            "products.productId": productId,
            "products.size": size
        })

        let currentQty = cartItem?.products?.find(p =>
            p.productId.toString() === productId && p.size === size
        )?.quantity || 0

        if (currentQty >= product.stock) {
            return res.status(400).json({
                message: `Only ${product.stock} items available`
            })
        }

        const updateCart = await cartModel.updateOne(
            { userId: userId, "products.productId": productId, "products.size": size },
            { $inc: { "products.$.quantity": 1 } }
        );

        if (updateCart.matchedCount === 0) {
            await cartModel.findOneAndUpdate(
                { userId },
                {
                    $push: { products: { productId, quantity: 1, size } }
                },
                { upsert: true, new: true }
            )
        }

        res
            .status(200)
            .json({ success: true, message: "Added to cart successfully" })

    } catch (err) {
        res.status(500).json({ message: "Add to cart error", Error: err.message })
    }
}

const removeFromCart = async (req, res) => {
    try {
        let userID = req.user.userID
        let productId = req.params.id
        const { size } = req.body

        if (!size) {
            return res.status(400).json({ message: "Size is required" })
        }

        const result = await cartModel.updateOne(
            { userId: userID },
            { $pull: { products: { productId: productId, size: size } } }
        )

        if (result.modifiedCount === 0) {
            return res.status(404).json({ message: "No product found in cart" })
        }

        res.status(200).json({ success: true, message: "Successfully removed from cart" })

    } catch (err) {
        res.status(500).json({ message: "Error while removing from cart", Error: err.message })
    }
}

const increaseQuantity = async (req, res) => {
    try {
        let userID = req.user.userID
        const productId = req.params.id
        const { size } = req.body

        const product = await productModel.findById(productId)

        if (!product) {
            return res.status(404).json({ message: "Product not found" })
        }

        const cart = await cartModel.findOne({ userId: userID })

        const item = cart.products.find(
            p => p.productId.toString() === productId && p.size === size
        )

        if (!item) {
            return res.status(404).json({ message: "Item not in cart" })
        }

        if (item.quantity >= product.stock) {
            return res.status(400).json({
                message: `Only ${product.stock} items available`
            })
        }

        await cartModel.updateOne(
            {
                userId: userID,
                "products.productId": productId,
                "products.size": size
            },
            { $inc: { "products.$.quantity": 1 } }
        )

        res.status(200).json({ success: true, message: "Quantity Increased" })

    } catch (err) {
        res.status(500).json({ message: "Error", error: err.message })
    }
}



const decreaseQuantity = async (req, res) => {
    try {
        let userID = req.user.userID
        const productId = req.params.id
        const { size } = req.body

        if (!size) {
            return res.status(400).json({ message: "Size is required" })
        }

        const cartData = await cartModel.updateOne(
            {
                userId: userID,
                products: {
                    $elemMatch: {
                        productId: productId,
                        size: size,
                        quantity: { $gt: 1 },
                    },
                },
            },
            { $inc: { "products.$.quantity": -1 } }
        )

        if (cartData.modifiedCount === 0) {
            return res.status(400).json({ message: "Minimum quantity is 1" })
        }

        res.status(200).json({ success: true, message: "Quantity-Decreased" })
    } catch (err) {
        res
            .status(500)
            .json({ message: "decrease-Quantity-Error", Error: err.message })
    }
}

const clearCart = async (req, res) => {
    try {
        const userID = req.user.userID

        await cartModel.updateOne(
            { userId: userID },
            { $set: { products: [] } }
        )

        res.status(200).json({
            success: true,
            message: "Cart cleared successfully"
        })
    } catch (err) {
        res.status(500).json({
            message: "Clear cart error",
            error: err.message
        })
    }
}

module.exports = {
    getCartItems,
    addToCart,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    clearCart
}