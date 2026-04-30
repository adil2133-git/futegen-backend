const express = require("express")
const router = express.Router();

const {getAllOrders, updateOrderStatus} = require("../../controllers/admin/adminOrderController")

router.get("/", getAllOrders)
router.patch("/:id", updateOrderStatus)

module.exports = router