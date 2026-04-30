// middleware/protectRoutes.js
const jwt = require("jsonwebtoken");
const User = require("../models/userModel")
require("dotenv").config();
console.log("name of the developer is adil")
const protectRoutes =  async (req, res, next) => {
    try {
        console.log("checking the cookies",req.cookies)
        let token =
            req.cookies?.Access_Token ||
            req.headers['x-access-token'] ||
            req.query?.token;

        if (!token && req.headers.authorization) {
            const authHeader = req.headers.authorization;

            if (authHeader.startsWith("Bearer ")) {
                token = authHeader.split(" ")[1];
            }
        }

        console.log("checking the token:",token)

        if (!token) {
            return res.status(401).json({
                message: "Unauthorized, Please login first"
            });
        }

        const decode = jwt.verify(token, process.env.ACCESS_TOKEN);

        const user = await User.findById(decode.id);

        if(!user){
            return res.status(401).json({
                message: "User not found"
            })
        }

        if(user.blocked){
            return res.status(403).json({
                message: "Your account has been blocked"
            })
        }

        req.user = {
            Email: decode.email,
            userID: decode.id,
            role: decode.role
        };

        next();

    } catch (err) {
        if (err.name === "TokenExpiredError") {
            return res.status(401).json({
                message: "Access token expired"
            });
        }
        return res.status(401).json({
            message: "Invalid token"
        });
    }
};

module.exports = protectRoutes;