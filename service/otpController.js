// const transporter = require("../config/mail");
// const generateOTP = require("../utils/generateOtp")
// const {client} = require("../config/redis")
// require("dotenv").config()

// const sendOtp = async (email) => {
//     try{
//         await transporter.verify();
//         console.log("SMTP SERVER READY");

//         const existingOtp = await client.get(`otp:${email}`);
//         if(existingOtp){
//             return{
//                 success: false,
//                 message: "OTP already sent. Try again later"
//             }
//         }


//         const otp = generateOTP()

//         await client.setEx(`otp:${email}`, 120, otp)

//         await transporter.sendMail({
//             from: process.env.EMAIL_USER,
//             to: email,
//             subject: "Your OTP Code",
//             text: `Your OTP is ${otp}`
//         });

//         return {success: true}
//     }catch(err){
//         console.log("send otp error", err);
//         return {success: false, message: "Failed to send OTP", Error: err.message}
//     }
// }


// const verifyOtp = async (email, userOtp) => {
//     try{
//         const storedOtp = await client.get(`otp:${email}`)

//         if(!storedOtp){
//             return {success: false}
//         }

//         if(storedOtp === userOtp){
//             await client.del(`otp:${email}`);
//             return {success: true}
//         }

//         return {success: false}
//     }catch(err){
//         console.log("Verify OTP Error:", err)
//         return {success: false, message: "Something went wrong", Error: err.message}
//     }
// }

// module.exports = {sendOtp, verifyOtp}





const resend = require("../config/mail");
const generateOTP = require("../utils/generateOtp");
const { client } = require("../config/redis");

require("dotenv").config();

const sendOtp = async (email) => {
    try {

        const existingOtp = await client.get(`otp:${email}`);

        if (existingOtp) {
            return {
                success: false,
                message: "OTP already sent. Try again later"
            };
        }

        const otp = generateOTP();

        await client.setEx(`otp:${email}`, 120, otp);

        await resend.emails.send({
            from: "onboarding@resend.dev",
            to: email,
            subject: "Your OTP Code",
            html: `
                <div style="font-family: Arial, sans-serif;">
                    <h2>OTP Verification</h2>
                    <p>Your OTP is:</p>
                    <h1>${otp}</h1>
                    <p>This OTP will expire in 2 minutes.</p>
                </div>
            `
        });

        return { success: true };

    } catch (err) {

        console.log("SEND OTP ERROR:", err);

        return {
            success: false,
            message: "Failed to send OTP",
            Error: err.message
        };
    }
};

const verifyOtp = async (email, userOtp) => {
    try {

        const storedOtp = await client.get(`otp:${email}`);

        if (!storedOtp) {
            return { success: false };
        }

        if (storedOtp === userOtp) {

            await client.del(`otp:${email}`);

            return { success: true };
        }

        return { success: false };

    } catch (err) {

        console.log("Verify OTP Error:", err);

        return {
            success: false,
            message: "Something went wrong",
            Error: err.message
        };
    }
};

module.exports = { sendOtp, verifyOtp };