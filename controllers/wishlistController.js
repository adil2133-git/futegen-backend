const wishlistModel = require("../models/wishlistModel")

const getWishlistData = async (req, res) => {
    try {
        const userId = req.user.userID

        const wishlistData = await wishlistModel
            .findOne({ userId })
            .populate("products")   
            .lean()

        if (!wishlistData) {
            return res.status(200).json({
                success: true,
                message: "Wishlist is Empty",
                data: []
            })
        }

        res.status(200).json({
            success: true,
            message: "Wishlist fetched successfully",
            data: wishlistData.products
        })
    } catch (err) {
        res.status(500).json({
            message: "Error in getWishListData Function",
            error: err.message
        })
    }
}

const addToWishlist = async (req, res) => {
    try {
        const userId = req.user.userID
        const productId = req.params.id

        await wishlistModel.findOneAndUpdate(
            { userId },
            { $addToSet: { products: productId } },
            { upsert: true, new: true }
        )

        res.status(200).json({
            success: true,
            message: "Added to wishlist"
        })
    } catch (err) {
        res.status(500).json({
            message: "Add to wishlist error",
            error: err.message
        })
    }
}

const removeFromWishlist = async (req, res) => {
    try {
        const userId = req.user.userID
        const productId = req.params.id

        const result = await wishlistModel.updateOne(
            { userId },
            { $pull: { products: productId } }
        )

        if (result.modifiedCount === 0) {
            return res.status(404).json({
                message: "Product not found in wishlist"
            })
        }

        res.status(200).json({
            success: true,
            message: "Removed from wishlist"
        })
    } catch (err) {
        res.status(500).json({
            message: "Remove wishlist error",
            error: err.message
        })
    }
}

const clearWishlist = async (req, res) => {
    try {
        const userId = req.user.userID

        await wishlistModel.updateOne(
            { userId },
            { $set: { products: [] } }
        )

        res.status(200).json({
            success: true,
            message: "Wishlist cleared"
        })
    } catch (err) {
        res.status(500).json({
            message: "Clear wishlist error",
            error: err.message
        })
    }
}

module.exports = {
    getWishlistData,
    addToWishlist,
    removeFromWishlist,
    clearWishlist
}