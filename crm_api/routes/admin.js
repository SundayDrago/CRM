const express = require("express");
const router = express.Router();
const db = require("../db.config/crm_db");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

// Configure Nodemailer
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "yacobedan@gmail.com", // Replace with your email
        pass: "vwdgnqgomanftnjv"   // Use an app password if 2FA is enabled
    }
});

// 🟢 Admin Registration Route
router.post("/register", async (req, res) => {
    const { full_name, username, email, password, confirmPassword } = req.body;

    if (!full_name || !username || !email || !password || !confirmPassword) {
        return res.status(400).json({ message: "All fields are required" });
    }

    if (password !== confirmPassword) {
        return res.status(400).json({ message: "Passwords do not match" });
    }

    try {
        // Check if admin already exists
        db.query("SELECT * FROM admins WHERE email = ? OR username = ?", [email, username], async (err, result) => {
            if (err) return res.status(500).json({ message: "Database error", error: err });

            if (result.length > 0) {
                return res.status(400).json({ message: "Email or Username already exists" });
            }

            const securityCode = crypto.randomBytes(3).toString("hex").toUpperCase(); // Example: "A1B2C3"
            const hashedPassword = await bcrypt.hash(password, 10);
            const hashedSecurityCode = await bcrypt.hash(securityCode, 10);

            // Insert admin data into the database
            db.query(
                "INSERT INTO admins (full_name, username, email, password, security_code, is_verified) VALUES (?, ?, ?, ?, ?, ?)",
                [full_name, username, email, hashedPassword, hashedSecurityCode, false],
                (err, result) => {
                    if (err) return res.status(500).json({ message: "Registration failed", error: err });

                    // Send security code via email
                    const mailOptions = {
                        from: "yacobedan@gmail.com",
                        to: email,
                        subject: "Admin Security Code - CRM System",
                        text: `Hello ${full_name},\n\nYour security code is: ${securityCode}.\n\nPlease enter this code to verify your email.\n\nThank you!`
                    };

                    transporter.sendMail(mailOptions, (error, info) => {
                        if (error) {
                            return res.status(500).json({ message: "Email could not be sent", error });
                        }
                        res.status(201).json({ message: "Admin registered. Check email for security code." });
                    });
                }
            );
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});

// 🟢 Security Code Verification Route
router.post("/verify-security-code", async (req, res) => {
    const { email, securityCode } = req.body;

    if (!email || !securityCode) {
        return res.status(400).json({ message: "Email and security code are required" });
    }

    try {
        db.query("SELECT * FROM admins WHERE email = ?", [email], async (err, result) => {
            if (err) return res.status(500).json({ message: "Database error", error: err });

            if (result.length === 0) {
                return res.status(400).json({ message: "Admin not found" });
            }

            const admin = result[0];

            const isMatch = await bcrypt.compare(securityCode, admin.security_code);
            if (!isMatch) {
                return res.status(400).json({ message: "Invalid security code" });
            }

            db.query("UPDATE admins SET is_verified = ? WHERE email = ?", [true, email], (err, result) => {
                if (err) return res.status(500).json({ message: "Verification failed", error: err });

                res.status(200).json({ message: "Email verified. Admin account activated." });
            });
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});

// 🟢 Admin Login Route
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    try {
        db.query("SELECT * FROM admins WHERE email = ?", [email], async (err, result) => {
            if (err) return res.status(500).json({ message: "Database error", error: err });

            if (result.length === 0) {
                return res.status(400).json({ message: "Invalid email or password" });
            }

            const admin = result[0];

            const isMatch = await bcrypt.compare(password, admin.password);
            if (!isMatch) {
                return res.status(400).json({ message: "Invalid email or password" });
            }

            if (!admin.is_verified) {
                return res.status(400).json({ message: "Account not verified. Please verify your email." });
            }

            const token = jwt.sign({ id: admin.id, email: admin.email }, "your_jwt_secret", { expiresIn: "1h" });

            res.status(200).json({ message: "Login successful", token: token });
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});

// 🟢 Forgot Password Route (Sends Reset Link)
router.post("/forgot-password", async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }

    try {
        db.query("SELECT * FROM admins WHERE email = ?", [email], async (err, result) => {
            if (err) return res.status(500).json({ message: "Database error", error: err });

            if (result.length === 0) {
                return res.status(400).json({ message: "Admin not found" });
            }

            const resetToken = crypto.randomBytes(32).toString("hex");
            const tokenExpiry = new Date();
            tokenExpiry.setHours(tokenExpiry.getHours() + 1);

            db.query("UPDATE admins SET reset_token = ?, reset_token_expiry = ? WHERE email = ?", [resetToken, tokenExpiry, email]);

            const resetLink = `http://localhost:5173/reset-password/${resetToken}`;
            const mailOptions = {
                from: "yacobedan@gmail.com",
                to: email,
                subject: "Password Reset Request",
                text: `Click the link to reset your password:\n\n${resetLink}\n\nExpires in 1 hour.`
            };

            transporter.sendMail(mailOptions);
            res.status(200).json({ message: "Password reset link sent." });
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});

// 🟢 Reset Password Route
router.post("/reset-password", async (req, res) => {
    const { token, newPassword } = req.body;

    try {
        db.query("SELECT * FROM admins WHERE reset_token = ?", [token], async (err, result) => {
            if (result.length === 0) {
                return res.status(400).json({ message: "Invalid or expired token" });
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);
            db.query("UPDATE admins SET password = ?, reset_token = NULL WHERE reset_token = ?", [hashedPassword, token]);

            res.status(200).json({ message: "Password reset successful." });
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});

module.exports = router;
