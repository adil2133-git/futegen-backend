const transporter = require("../config/mail");
require("dotenv").config()

const sendContactMessage = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
            return res.status(400).json({ success: false, message: "All fields required" });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ success: false, message: "Invalid email" });
        }

        console.log("Contact message from:", email);

        await transporter.sendMail({
            from: `"FUTGEN Contact" <${process.env.EMAIL_USER}>`,
            to: process.env.ADMIN_EMAIL,
            replyTo: email,
            subject: `Contact: ${subject}`,
            html: `
                <h3>New Contact Message</h3>
                <p><b>Name:</b> ${name}</p>
                <p><b>Email:</b> ${email}</p>
                <p><b>Subject:</b> ${subject}</p>
                <p><b>Message:</b></p>
                <p>${message}</p>
            `
        });

        res.json({ success: true, message: "Message sent successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Failed to send message" });
    }
};

module.exports = { sendContactMessage };