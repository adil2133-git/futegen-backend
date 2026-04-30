const transporter = require("../config/mail");
const generateOTP = require("../Utils/generateOtp")
const {client} = require("../config/redis")
require("dotenv").config()

const sendOtp = async (email) => {
    try{
        const existingOtp = await client.get(`otp:${email}`);
        if(existingOtp){
            return{
                success: false,
                message: "OTP already sent. Try again later"
            }
        }


        const otp = generateOTP()

        await client.setEx(`otp:${email}`, 120, otp)

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Your OTP Code",
            text: `Your OTP is ${otp}`
        });

        return {success: true}
    }catch(err){
        console.log("send otp error", err);
        return {success: false, message: "Failed to send OTP"}
    }
}


const verifyOtp = async (email, userOtp) => {
    try{
        const storedOtp = await client.get(`otp:${email}`)

        if(!storedOtp){
            return {success: false}
        }

        if(storedOtp === userOtp){
            await client.del(`otp:${email}`);
            return {success: true}
        }

        return {success: false}
    }catch(err){
        console.log("Verify OTP Error:", err)
        return {success: false, message: "Something went wrong"}
    }
}

module.exports = {sendOtp, verifyOtp}