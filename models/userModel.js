const mongoose = require("mongoose")

const userSchema = mongoose.Schema({
    Fname: {
        type: String,
        required: true,
        minlength: 3,
        trim: true
    },
    Lname: {
        type: String,
        required: true,
        minlength: 1,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
        select: false  
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    },
    blocked: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const userModel = mongoose.model("User", userSchema)

module.exports = userModel