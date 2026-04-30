const express = require("express")
const router = express.Router()

const{ getAllUsers, updateUserStatus } = require("../../controllers/admin/adminUserController")

router.get("/", getAllUsers)
router.patch("/:id", updateUserStatus)

module.exports = router