const jwt = require("jsonwebtoken");

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ success: false, message: "No token provided" });
        }

        const decoded = jwt.verify(token, "x-auth-token");
        req.userId = decoded.id;

        // Check if MQTT client exists for the user
        if (!req.mqttClients.has(req.userId)) {
            return res.status(400).json({ success: false, message: "No MQTT connection for this user" });
        }

        next();
    } catch (error) {
        res.status(401).json({ success: false, message: "Invalid token" });
    }
};

module.exports = authMiddleware;