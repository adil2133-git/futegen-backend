const {z} = require("zod")

const registerValidate = z.object({
    Fname:z.string().min(3, "First name must be at least 3 characters"),
    Lname:z.string().min(1, "Last name is required"),
    email:z.string().trim().email("Invalid email"),
    password:z.string().min(5, "Password must be at least 5 characters")
})

module.exports = registerValidate