const express = require("express")
const router = express.Router()

const {getDashboardStats} = require("../../controllers/admin/adminDashboardController")

router.get("/", getDashboardStats)

module.exports = router