const express = require("express")
const router = express.Router()

const{ getAllUsers, updateUserStatus } = require("../../controllers/Admin/adminUserController")

router.get("/", getAllUsers)
router.patch("/:id", updateUserStatus)

module.exports = router