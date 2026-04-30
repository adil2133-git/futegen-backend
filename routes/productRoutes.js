const express = require("express")
const router = express.Router()

const { getProducts, getSingleProduct} = require("../controllers/productController")

router.get("/", getProducts)
router.get("/:id", getSingleProduct)

module.exports = router