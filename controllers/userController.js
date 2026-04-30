const User = require("../models/userModel");
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

const generateToken = require("../utils/tokenGenerate");
const { client } = require("../config/redis");
const { sendOtp, verifyOtp } = require("../service/otpController");
const userModel = require("../models/userModel");


const RegisterController = async (req, res) => {
    try {
        const { Fname, Lname, email, password } = req.body;

        if (!Fname || !Lname || !email || !password) {
            return res.status(400).json({ message: "All fields are required" })
        }

        if (Fname.trim().length < 3) {
            return res.status(400).json({ message: "First name must be at least 3 characters" })
        }

        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(409).json({ message: "User already exists" })
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await client.setEx(
            `register:${email}`,
            300,
            JSON.stringify({
                Fname,
                Lname,
                email,
                password: hashedPassword
            })
        )

        const result = await sendOtp(email)

        if (!result.success) {
            return res.status(500).json({ message: "Failed to send OTP" })
        }

        res.status(200).json({ message: "OTP sent. Please verify to complete registration" })

    } catch (err) {
        res.status(500).json({ message: "Internal server error" })
    }
}



const verifyOtpController = async (req, res) => {
    try {
        const { email, otp } = req.body


        if (!email || !otp) {
            return res.status(400).json({ message: "Email and OTP are required" })
        }

        const result = await verifyOtp(email, otp)

        if (!result.success) {
            return res.status(400).json({ message: "Invalid or expired OTP" })
        }

        const userData = await client.get(`register:${email}`)

        if (!userData) {
            return res.status(400).json({ message: "Registration session expired" })
        }

        const { Fname, Lname, password } = JSON.parse(userData)

        const existingUser = await userModel.findOne({ email })
        if (existingUser) {
            return res.status(409).json({ message: "User already exists" })
        }

        const newUser = await userModel.create({
            Fname,
            Lname,
            email,
            password
        })


        const { AccessToken, RefreshToken } = generateToken(
            newUser.email,
            newUser._id,
            newUser.role
        )


        await client.del(`register:${email}`);

        // const isProduction = process.env.NODE_ENV === "production";


        return res
            .status(201)
            .cookie("Access_Token", AccessToken, {
                httpOnly: true,
                secure: true,
                sameSite: "None"
            })
            .cookie("Refresh_Token", RefreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: "None"
            })
            .json({
                message: "User registered successfully",
                user: {
                    _id: newUser._id,
                    Fname: newUser.Fname,
                    Lname: newUser.Lname,
                    email: newUser.email,
                    role: newUser.role
                }
            })
    } catch (err) {
        res.status(500).json({ message: "Internal server error" })
    }
}


const resendOTPController = async (req, res) => {
    try {
        const { email } = req.body

        if (!email) {
            return res.status(400).json({ message: "Email is required" })
        }

        const result = await sendOtp(email)

        if (!result.success) {
            return res.status(429).json({ message: result.message })
        }

        res.status(200).json({ message: "OTP sent successfully" })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}






const LoginController = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" })
        }

        const user = await User.findOne({ email }).select("+password");

        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" })
        }

        if (user.blocked) {
            return res.status(403).json({
                message: "Your account is blocked by admin"
            })
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const { AccessToken, RefreshToken } = generateToken(user.email, user._id, user.role)

        // const isProduction = process.env.NODE_ENV === "production";


        return res
            .status(200)
            .cookie("Access_Token", AccessToken, {
                httpOnly: true,
                secure: true,
                sameSite: "none"
            })
            .cookie("Refresh_Token", RefreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: "none"
            })
            .json({
                message: "Login Successful",
                user: {
                    id: user._id,
                    Fname: user.Fname,
                    Lname: user.Lname,
                    email: user.email,
                    role: user.role
                }
            })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}


const logoutController = async (req, res) => {
    try {
        // const isProduction = process.env.NODE_ENV === "production";

        res
            .clearCookie("Access_Token", {
                httpOnly: true,
                secure: true,
                sameSite: "none"
            })
            .clearCookie("Refresh_Token", {
                httpOnly: true,
                secure: true,
                sameSite: "none"
            })
            .status(200)
            .json({ message: "Logged out successfully" })
    } catch (err) {
        res.status(500).json({
            message: "Logout failed",
            error: err.message
        })
    }
}

const GetLoginUser = async (req, res) => {
    try {
        console.log("user is there:", req.user)
        console.log("user id:", req.user.userID)
        if (!req.user) {
            return res.status(401).json({
                message: "Unauthorized"
            });
        }
        const userData = await User.findOne({ _id: req.user.userID })
        console.log("user data from db:", userData)

        res.status(200).json({
            message: "User profile fetched successfully",
            user: userData
        })
    } catch (err) {
        res.status(500).json({
            message: "Error in GetLoginUser",
            Error: err.message
        })
    }
}

module.exports = { RegisterController, verifyOtpController, resendOTPController, LoginController, logoutController, GetLoginUser }