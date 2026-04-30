const express = require("express")
const router = express.Router()
const protectRoute = require("../middleware/protectRoute")
const { createOrder, getUserOrders } = require("../controllers/orderController")

router.get("/", protectRoute, getUserOrders)
router.post("/", protectRoute, createOrder)

module.exports = router