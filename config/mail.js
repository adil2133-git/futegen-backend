const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,

    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },

    family: 4, // force IPv4 instead of IPv6

    connectionTimeout: 60000,
    greetingTimeout: 60000,
    socketTimeout: 60000,

    tls: {
        rejectUnauthorized: false
    },

    pool: true,
    maxConnections: 5,
    maxMessages: 100,

    debug: true,
    logger: true
});

module.exports = transporter;