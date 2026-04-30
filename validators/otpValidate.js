const {z} = require("zod")

const verifyOtpValidate = z.object({
    email:z.string().trim().email("Invalid email"),
    otp:z.string().length(6,"OTP must be 6 digits")
})

module.exports = verifyOtpValidate