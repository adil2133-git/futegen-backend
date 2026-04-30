const {z} = require("zod")

const loginValidate = z.object({
    email:z.string().trim().email("Invalid email"),
    password:z.string().min(5)
})

module.exports = loginValidate