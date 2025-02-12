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

// Admin Registration Route
router.post("/register", async (req, res) => {
    console.log("Headers:", req.headers);
    console.log("Received raw body:", req.body);

    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ message: "Request body is missing or empty" });
    }

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

            // Generate security code (random 6-character code)
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

// Security Code Verification Route
router.post("/verify-security-code", async (req, res) => {
    const { email, securityCode } = req.body;

    if (!email || !securityCode) {
        return res.status(400).json({ message: "Email and security code are required" });
    }

    try {
        // Find the admin by email
        db.query("SELECT * FROM admins WHERE email = ?", [email], async (err, result) => {
            if (err) return res.status(500).json({ message: "Database error", error: err });

            if (result.length === 0) {
                return res.status(400).json({ message: "Admin not found" });
            }

            const admin = result[0];

            // Compare provided security code with hashed version in DB
            const isMatch = await bcrypt.compare(securityCode, admin.security_code);
            if (!isMatch) {
                return res.status(400).json({ message: "Invalid security code" });
            }

            // Update admin as verified
            db.query("UPDATE admins SET is_verified = ? WHERE email = ?", [true, email], (err, result) => {
                if (err) return res.status(500).json({ message: "Verification failed", error: err });

                res.status(200).json({ message: "Email verified. Admin account activated." });
            });
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});

// Admin Login Route
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    try {
        // Find the admin by email
        db.query("SELECT * FROM admins WHERE email = ?", [email], async (err, result) => {
            if (err) return res.status(500).json({ message: "Database error", error: err });

            if (result.length === 0) {
                return res.status(400).json({ message: "Invalid email or password" });
            }

            const admin = result[0];

            // Check if the password matches
            const isMatch = await bcrypt.compare(password, admin.password);
            if (!isMatch) {
                return res.status(400).json({ message: "Invalid email or password" });
            }

            // Check if the admin is verified
            if (!admin.is_verified) {
                return res.status(400).json({ message: "Account not verified. Please verify your email." });
            }

            // Generate a JWT token
            const token = jwt.sign(
                { id: admin.id, email: admin.email },
                "your_jwt_secret", // Use a strong secret key
                { expiresIn: "1h" } // Token expiration time
            );

            // Return the JWT token
            res.status(200).json({
                message: "Login successful",
                token: token
            });
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});

module.exports = router;
