const express = require("express")
const router = express.Router()

const {getDashboardStats} = require("../../controllers/Admin/adminDashboardController")

router.get("/", getDashboardStats)

module.exports = router