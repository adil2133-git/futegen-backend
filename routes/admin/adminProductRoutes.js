const express = require("express")
const router = express.Router()
const upload = require("../../middleware/upload")

const {getAllProducts, addProduct, updateProduct, deleteProduct, toggleProudctStatus} = require("../../controllers/admin/adminProductController")

router.get("/", getAllProducts)
router.post("/", upload.single("image"), addProduct)
router.put("/:id", upload.single("image"), updateProduct)
router.delete("/:id", deleteProduct)
router.patch("/:id/toggle", toggleProudctStatus)

module.exports = router