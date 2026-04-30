const express = require("express")
const router = express.Router()
const protectRoute = require("../middleware/protectRoute")

const { createRazorpayOrder, verifyPayment } = require("../controllers/paymentController")

router.post("/create-order", createRazorpayOrder)
router.post("/verify", protectRoute, verifyPayment)

module.exports = router