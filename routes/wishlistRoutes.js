const express = require("express")
const router = express.Router()

const {getWishlistData, addToWishlist, removeFromWishlist, clearWishlist} = require("../controllers/wishlistController")
const protectRoute = require("../middleware/protectRoute")

router.get("/", protectRoute, getWishlistData)
router.post("/add/:id", protectRoute, addToWishlist)
router.delete("/remove/:id", protectRoute, removeFromWishlist)
router.delete("/clear", protectRoute, clearWishlist)

module.exports = router