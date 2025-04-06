const express = require("express");
const router = express.Router();
const db = require("../db.config/crm_db"); // Ensure this is your correct DB config
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

// Middleware to verify JWT (for protected routes)
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>
    if (!token) return res.status(401).json({ message: "Access denied. No token provided." });

    try {
        const decoded = jwt.verify(token, "your_jwt_secret");
        req.admin = decoded; // Attach admin info to request
        next();
    } catch (error) {
        res.status(403).json({ message: "Invalid token" });
    }
};

// Configure Nodemailer
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "yacobedan@gmail.com", // Replace with your email
        pass: "vwdgnqgomanftnjv"   // Use an app password if 2FA is enabled
    }
});

// Constants for login attempt limits
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds

// Helper function to notify admin of lockout
const notifyAdminOfLockout = (user, attemptTime) => {
    const mailOptions = {
        from: "yacobedan@gmail.com",
        to: "admin@example.com", // Replace with actual admin email or fetch from DB
        subject: "Account Lockout Notification - CRM System",
        text: `
            Dear Admin,

            An account has been locked due to exceeding the allowed login attempts.

            User Details:
            - Name: ${user.name}
            - Email: ${user.email}
            - Time of Last Attempt: ${new Date(attemptTime).toLocaleString()}
            - Number of Attempts: ${user.login_attempts}

            Please review this account for security purposes.

            Regards,
            CRM System
        `
    };

    transporter.sendMail(mailOptions, (error) => {
        if (error) {
            console.error("Failed to send lockout notification:", error);
        } else {
            console.log("Lockout notification sent to admin");
        }
    });
};

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
        db.query("SELECT * FROM admins WHERE email = ? OR username = ?", [email, username], async (err, result) => {
            if (err) return res.status(500).json({ message: "Database error", error: err });

            if (result.length > 0) {
                return res.status(400).json({ message: "Email or Username already exists" });
            }

            const securityCode = crypto.randomBytes(3).toString("hex").toUpperCase();
            const hashedPassword = await bcrypt.hash(password, 10);
            const hashedSecurityCode = await bcrypt.hash(securityCode, 10);

            db.query(
                "INSERT INTO admins (full_name, username, email, password, security_code, is_verified) VALUES (?, ?, ?, ?, ?, ?)",
                [full_name, username, email, hashedPassword, hashedSecurityCode, false],
                (err, result) => {
                    if (err) return res.status(500).json({ message: "Registration failed", error: err });

                    const mailOptions = {
                        from: "yacobedan@gmail.com",
                        to: email,
                        subject: "Admin Security Code - CRM System",
                        text: `Hello ${full_name},\n\nYour security code is: ${securityCode}.\n\nPlease enter this code to verify your email.\n\nThank you!`
                    };

                    transporter.sendMail(mailOptions, (error) => {
                        if (error) {
                            return res.status(500).json({ message: "Email could not be sent", error });
                        }
                        res.status(201).json({ message: "Admin registered. Check email for security code." }); // Fixed typo 'Ares'
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

            db.query("UPDATE admins SET is_verified = ? WHERE email = ?", [true, email], (err) => {
                if (err) return res.status(500).json({ message: "Verification failed", error: err });
                res.status(200).json({ message: "Email verified. Admin account activated." });
            });
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});

// 🟢 Admin Login Route (Updated for Lockout)
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

            // Check if account is locked
            if (admin.is_locked && new Date() < new Date(admin.lockout_until)) {
                const remainingTime = Math.ceil((new Date(admin.lockout_until) - new Date()) / 60000);
                return res.status(403).json({ 
                    message: `Account is locked due to too many failed attempts. Try again in ${remainingTime} minutes.` 
                });
            }

            const isMatch = await bcrypt.compare(password, admin.password);
            if (!isMatch) {
                const newAttempts = (admin.login_attempts || 0) + 1;
                if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
                    const lockoutUntil = new Date(Date.now() + LOCKOUT_DURATION);
                    db.query(
                        "UPDATE admins SET login_attempts = ?, is_locked = ?, lockout_until = ? WHERE email = ?",
                        [newAttempts, true, lockoutUntil, email],
                        (err) => {
                            if (err) console.error("Failed to update lockout status:", err);
                            notifyAdminOfLockout(admin, Date.now());
                            res.status(403).json({ message: "Account locked due to too many failed attempts. Admin notified." });
                        }
                    );
                } else {
                    db.query(
                        "UPDATE admins SET login_attempts = ? WHERE email = ?",
                        [newAttempts, email],
                        (err) => {
                            if (err) console.error("Failed to update login attempts:", err);
                            res.status(400).json({ message: `Invalid email or password. Attempt ${newAttempts} of ${MAX_LOGIN_ATTEMPTS}` });
                        }
                    );
                }
                return;
            }

            if (!admin.is_verified) {
                return res.status(400).json({ message: "Account not verified. Please verify your email." });
            }

            // Reset login attempts on successful login
            db.query("UPDATE admins SET login_attempts = 0, is_locked = 0, lockout_until = NULL WHERE email = ?", [email]);

            const token = jwt.sign({ id: admin.id, email: admin.email }, "your_jwt_secret", { expiresIn: "1h" });
            res.status(200).json({ message: "Login successful", token });
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});

// 🟢 Forgot Password Route
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

            db.query("UPDATE admins SET reset_token = ?, reset_token_expiry = ? WHERE email = ?", [resetToken, tokenExpiry, email], (err) => {
                if (err) return res.status(500).json({ message: "Database error", error: err });

                const resetLink = `http://localhost:5173/reset-password/${resetToken}`;
                const mailOptions = {
                    from: "yacobedan@gmail.com",
                    to: email,
                    subject: "Password Reset Request",
                    text: `Click the link to reset your password:\n\n${resetLink}\n\nExpires in 1 hour.`
                };

                transporter.sendMail(mailOptions, (error) => {
                    if (error) {
                        return res.status(500).json({ message: "Email could not be sent", error });
                    }
                    res.status(200).json({ message: "Password reset link sent." });
                });
            });
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});

// 🟢 Reset Password Route
router.post("/reset-password", async (req, res) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
        return res.status(400).json({ message: "Token and new password are required" });
    }

    try {
        db.query("SELECT * FROM admins WHERE reset_token = ?", [token], async (err, result) => {
            if (err) return res.status(500).json({ message: "Database error", error: err });
            if (result.length === 0) {
                return res.status(400).json({ message: "Invalid or expired token" });
            }

            const admin = result[0];
            const now = new Date();
            if (new Date(admin.reset_token_expiry) < now) {
                return res.status(400).json({ message: "Token has expired" });
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);
            db.query(
                "UPDATE admins SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE reset_token = ?",
                [hashedPassword, token],
                (err) => {
                    if (err) return res.status(500).json({ message: "Database error", error: err });
                    res.status(200).json({ message: "Password reset successful." });
                }
            );
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});

// 🟢 Get All Users (Protected Route)
router.get("/users", authenticateToken, (req, res) => {
    db.query("SELECT id, name, email, status FROM users", (err, result) => {
        if (err) return res.status(500).json({ message: "Database error", error: err });
        res.status(200).json(result);
    });
});

// 🟢 Invite User (Protected Route)
router.post("/users/invite", authenticateToken, async (req, res) => {
    console.log("Hit /api/admin/users/invite"); // Debug log
    const { name, email } = req.body;

    if (!name || !email) {
        return res.status(400).json({ message: "Name and email are required" });
    }

    try {
        db.query("SELECT * FROM users WHERE email = ?", [email], async (err, result) => {
            if (err) return res.status(500).json({ message: "Database error", error: err });
            if (result.length > 0) {
                return res.status(400).json({ message: "User with this email already exists" });
            }

            const tempPassword = crypto.randomBytes(8).toString("hex");
            const hashedPassword = await bcrypt.hash(tempPassword, 10);
            const setupToken = crypto.randomBytes(32).toString("hex");
            const tokenExpiry = new Date();
            tokenExpiry.setHours(tokenExpiry.getHours() + 24);

            db.query(
                "INSERT INTO users (name, email, password, status, setup_token, setup_token_expiry) VALUES (?, ?, ?, ?, ?, ?)",
                [name, email, hashedPassword, "Pending", setupToken, tokenExpiry],
                (err, result) => {
                    if (err) return res.status(500).json({ message: "Database error", error: err });

                    const setupLink = `http://localhost:5173/setup-account/${setupToken}`;
                    const mailOptions = {
                        from: "yacobedan@gmail.com",
                        to: email,
                        subject: "Account Setup Invitation - CRM System",
                        text: `Hello ${name},\n\nYou have been invited to join the CRM system.\n\nTemporary Password: ${tempPassword}\nSetup Link: ${setupLink}\n\nThis link expires in 24 hours.\n\nThank you!`
                    };

                    transporter.sendMail(mailOptions, (error) => {
                        if (error) {
                            console.error("Email sending error:", error);
                            return res.status(500).json({ message: "Failed to send invitation email", error: error.message });
                        }
                        res.status(201).json({
                            message: "User invited successfully",
                            id: result.insertId
                        });
                    });
                }
            );
        });
    } catch (error) {
        console.error("Server error in /users/invite:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// 🟢 Update User (Protected Route)
router.put("/users/:id", authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { name, email } = req.body;

    if (!name || !email) {
        return res.status(400).json({ message: "Name and email are required" });
    }

    try {
        db.query("SELECT * FROM users WHERE id = ?", [id], (err, result) => {
            if (err) return res.status(500).json({ message: "Database error", error: err });
            if (result.length === 0) {
                return res.status(404).json({ message: "User not found" });
            }

            db.query(
                "UPDATE users SET name = ?, email = ? WHERE id = ?",
                [name, email, id],
                (err) => {
                    if (err) return res.status(500).json({ message: "Database error", error: err });
                    res.status(200).json({ message: "User updated successfully" });
                }
            );
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});

// 🟢 Delete User (Protected Route)
router.delete("/users/:id", authenticateToken, (req, res) => {
    const { id } = req.params;

    db.query("SELECT * FROM users WHERE id = ?", [id], (err, result) => {
        if (err) return res.status(500).json({ message: "Database error", error: err });
        if (result.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        db.query("DELETE FROM users WHERE id = ?", [id], (err) => {
            if (err) return res.status(500).json({ message: "Database error", error: err });
            res.status(200).json({ message: "User deleted successfully" });
        });
    });
});

// 🟢 Setup Account Route
router.post("/setup-account", async (req, res) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
        return res.status(400).json({ message: "Token and new password are required" });
    }

    try {
        db.query("SELECT * FROM users WHERE setup_token = ?", [token], async (err, result) => {
            if (err) return res.status(500).json({ message: "Database error", error: err });
            if (result.length === 0) {
                return res.status(400).json({ message: "Invalid or expired token" });
            }

            const user = result[0];
            const now = new Date();
            if (new Date(user.setup_token_expiry) < now) {
                return res.status(400).json({ message: "Setup token has expired" });
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);
            db.query(
                "UPDATE users SET password = ?, status = ?, setup_token = NULL, setup_token_expiry = NULL WHERE setup_token = ?",
                [hashedPassword, "Active", token],
                (err) => {
                    if (err) return res.status(500).json({ message: "Database error", error: err });
                    res.status(200).json({ message: "Account setup successful. You can now log in." });
                }
            );
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});

// 🟢 Test Route for Debugging
router.get("/test", (req, res) => {
    res.json({ message: "Admin router working" });
});

module.exports = router;