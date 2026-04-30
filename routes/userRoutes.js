const express = require("express")
const router = express.Router()

const { RegisterController, verifyOtpController, LoginController, logoutController, GetLoginUser, resendOTPController } = require("../controllers/userController")
const registerValidate = require("../validators/registerValidate")
const loginValidate = require("../validators/loginValidate")
const verifyOtpValidate = require("../validators/otpValidate")
const protectRoutes = require("../middleware/protectRoute")
const validate = require("../middleware/validate")
const TokenRegenrator = require("../service/tokenRegenerate")

router.post("/register", validate(registerValidate), RegisterController)
router.post("/verify-otp", validate(verifyOtpValidate), verifyOtpController)
router.post("/resend-otp", resendOTPController)
router.post("/login", validate(loginValidate), LoginController)
router.post("/logout", logoutController)
router.get("/getUser", protectRoutes, GetLoginUser)
router.post('/refresh', TokenRegenrator)


module.exports = router