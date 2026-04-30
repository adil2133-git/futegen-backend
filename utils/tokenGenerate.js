const jwt = require("jsonwebtoken")
require("dotenv").config()

const buildTokenPayload = (email, userID, role) => ({
    email: email,
    id: userID,
    role
});

const generateToken = (email, userID, role) => {
    const payload = buildTokenPayload(email, userID, role);

    const RefreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN, { expiresIn: "7d" });

    const AccessToken = jwt.sign(payload, process.env.ACCESS_TOKEN, { expiresIn: "1m" });

    return { RefreshToken, AccessToken }
}

module.exports = generateToken