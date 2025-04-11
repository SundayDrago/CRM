// routes/auth.js
const express = require("express");
const router = express.Router();
const db = require("../db.config/crm_db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    try {
        // Check admins table first
        const [admins] = await db.promise().query("SELECT * FROM admins WHERE email = ?", [email]);
        let user, isAdmin, redirect;

        if (admins.length > 0) {
            // Admin login
            user = admins[0];
            isAdmin = true;
            redirect = "/admin";

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ message: "Invalid email or password" });
            }
            if (!user.is_verified) {
                return res.status(403).json({ message: "Account not verified. Please verify your email." });
            }
        } else {
            // Check users table
            const [users] = await db.promise().query("SELECT * FROM users WHERE email = ?", [email]);
            if (users.length === 0) {
                return res.status(401).json({ message: "Invalid email or password" });
            }

            user = users[0];
            isAdmin = false;
            redirect = "/users-dashboard";

            // Ensure user has a permanent password and not just temp_password
            if (!user.password) {
                return res.status(403).json({ message: "Account not fully set up. Please complete setup." });
            }
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ message: "Invalid email or password" });
            }
            if (user.status !== "active") {
                return res.status(403).json({ message: "Account not active. Please contact an admin." });
            }
        }

        // Generate JWT
        const token = jwt.sign(
            { id: user.id, email: user.email, isAdmin },
            "your_jwt_secret",
            { expiresIn: "1h" }
        );

        // Response with redirect
        res.status(200).json({
            status: "success",
            token,
            user: { id: user.id, email: user.email, isAdmin },
            redirect // /admin or /users-dashboard
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

module.exports = router;