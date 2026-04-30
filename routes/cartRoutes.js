const express = require("express")
const router = express.Router()

const protectRoute = require("../middleware/protectRoute")
const {addToCart, removeFromCart, getCartItems, increaseQuantity, decreaseQuantity, clearCart} = require("../controllers/cartController")

router.get("/", protectRoute, getCartItems)
router.post("/add/:id", protectRoute, addToCart)
router.delete("/remove/:id", protectRoute, removeFromCart)
router.patch("/increase/:id", protectRoute, increaseQuantity)
router.patch("/decrease/:id", protectRoute, decreaseQuantity)
router.delete("/clear", protectRoute, clearCart)

module.exports = router