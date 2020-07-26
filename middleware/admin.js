const jwt = require("jsonwebtoken");
const config = require("config");

function admin (req, res, next) {
    const token = req.header("x-auth-token");
    if (!token) return res.status(401).send("Access denied. No token provided.");

    try {
        const decoded = jwt.verify(token, config.get("jwtPrivateKey"));
        if (!decoded.isAdmin) return res.status(403).send("Access denied. No authorization.");
        req.user = decoded;
        next();
    } catch (e){
        res.status(400).send("Invalid token.");
    }
}

module.exports = admin;