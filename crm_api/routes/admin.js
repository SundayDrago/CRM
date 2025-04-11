const express = require("express");
const router = express.Router();
const db = require("../db.config/crm_db");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

// Middleware to verify JWT and ensure admin access
const authenticateAdminToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Access denied. No token provided." });

    try {
        const decoded = jwt.verify(token, "your_jwt_secret");
        req.user = decoded;
        if (!req.user.isAdmin) {
            return res.status(403).json({ message: "Access denied. Admin privileges required." });
        }
        next();
    } catch (error) {
        res.status(403).json({ message: "Invalid token" });
    }
};

// Configure Nodemailer
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "yacobedan@gmail.com",
        pass: "qdbdgryrzwodqksg"
    }
});

// Notification endpoint
router.post('/users/send-notification', authenticateAdminToken, async (req, res) => {
  try {
    const { email, type, changes, userId } = req.body;

    let mailOptions;
    let subject;
    let text;

    switch (type) {
      case 'account_updated':
        subject = 'Your Account Has Been Updated';
        text = `Dear user,\n\n`;
        text += `Your account information has been updated by an administrator.\n\n`;

        if (changes.username) {
          text += `Username changed from "${changes.username.old}" to "${changes.username.new}"\n`;
        }
        if (changes.email) {
          text += `Email changed from "${changes.email.old}" to "${changes.email.new}"\n`;
        }

        text += `\nIf you did not request these changes, please contact support immediately.\n\n`;
        text += `Best regards,\nThe Support Team`;
        break;

      case 'account_deleted':
        subject = 'Your Account Has Been Deleted';
        text = `Dear user,\n\n`;
        text += `Your account has been deleted from our system by an administrator.\n\n`;
        text += `You will no longer be able to access our services with this account.\n\n`;
        text += `If you believe this was done in error, please contact support immediately.\n\n`;
        text += `Best regards,\nThe Support Team`;
        break;

      default:
        return res.status(400).json({ message: 'Invalid notification type' });
    }

    mailOptions = {
      from: process.env.EMAIL_FROM || "yacobedan@gmail.com",
      to: email,
      subject: subject,
      text: text,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Notification sent successfully' });
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({ message: 'Failed to send notification' });
  }
});

// admin.js
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    try {
        const [admins] = await db.promise().query("SELECT * FROM admins WHERE email = ?", [email]);
        if (admins.length === 0) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const admin = admins[0];
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        if (!admin.is_verified) {
            return res.status(403).json({ message: "Email not verified" });
        }

        const token = jwt.sign({ id: admin.id, isAdmin: true }, "your_jwt_secret", { expiresIn: "1h" });
        res.status(200).json({ message: "Login successful", token, redirect: "/admin" });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// 🟢 Admin Registration Route
router.post("/register", async (req, res) => {
    const { full_name, username, email, password, confirmPassword } = req.body;

    // Input validation
    if (!full_name || !username || !email || !password || !confirmPassword) {
        return res.status(400).json({ message: "All fields are required" });
    }
    if (password !== confirmPassword) {
        return res.status(400).json({ message: "Passwords do not match" });
    }
    if (password.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters long" });
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
        return res.status(400).json({ message: "Invalid email format" });
    }

    try {
        // Check for existing email in both admins and users tables
        const [existingAdmins] = await db.promise().query(
            "SELECT * FROM admins WHERE email = ? OR username = ?",
            [email, username]
        );
        const [existingUsers] = await db.promise().query(
            "SELECT * FROM users WHERE email = ?",
            [email]
        );

        if (existingAdmins.length > 0) {
            return res.status(400).json({
                message: existingAdmins[0].email === email ? "Email already exists" : "Username already exists"
            });
        }
        if (existingUsers.length > 0) {
            return res.status(400).json({ message: "Email already exists in user accounts" });
        }

        const securityCode = crypto.randomBytes(3).toString("hex").toUpperCase();
        const hashedPassword = await bcrypt.hash(password, 10);
        const hashedSecurityCode = await bcrypt.hash(securityCode, 10);

        await db.promise().query(
            "INSERT INTO admins (full_name, username, email, password, security_code, is_verified) VALUES (?, ?, ?, ?, ?, ?)",
            [full_name, username, email, hashedPassword, hashedSecurityCode, false]
        );

        const mailOptions = {
            from: "yacobedan@gmail.com",
            to: email,
            subject: "Admin Security Code - CRM System",
            text: `Hello ${full_name},\n\nYour security code is: ${securityCode}.\n\nPlease enter this code to verify your email.\n\nThank you!`
        };

        transporter.sendMail(mailOptions, (error) => {
            if (error) {
                console.error("Email sending error:", error);
                return res.status(500).json({ message: "Email could not be sent", error: error.message });
            }
            res.status(201).json({ message: "Admin registered. Check your email for the security code." });
        });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// 🟢 Admin Security Code Verification Route
router.post("/verify-security-code", async (req, res) => {
    const { email, securityCode } = req.body;

    // Input validation
    if (!email || !securityCode) {
        return res.status(400).json({ message: "Email and security code are required" });
    }

    try {
        const [admins] = await db.promise().query("SELECT * FROM admins WHERE email = ?", [email]);
        if (admins.length === 0) {
            return res.status(404).json({ message: "Admin not found" });
        }

        const admin = admins[0];
        const isMatch = await bcrypt.compare(securityCode, admin.security_code);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid security code" });
        }

        await db.promise().query("UPDATE admins SET is_verified = ? WHERE email = ?", [true, email]);
        res.status(200).json({ message: "Email verified. Admin account activated." });
    } catch (error) {
        console.error("Verification error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// 🟢 Get Admin Profile Route
router.get("/profile", authenticateAdminToken, async (req, res) => {
    const adminId = req.user.id;

    try {
        const [admins] = await db.promise().query(
            "SELECT full_name, username, email, avatar FROM admins WHERE id = ?",
            [adminId]
        );
        if (admins.length === 0) {
            return res.status(404).json({ message: "Admin not found" });
        }

        res.status(200).json(admins[0]);
    } catch (error) {
        console.error("Profile fetch error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// 🟢 Get All Users (Admin-Only Route)
router.get("/users", authenticateAdminToken, async (req, res) => {
    try {
        const [users] = await db.promise().query(
            "SELECT id, username, email, status, created_by, created_at FROM users"
        );
        res.status(200).json(users);
    } catch (error) {
        console.error("Users fetch error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// 🟢 Invite User (Admin-Only Route)
router.post("/users/invite", authenticateAdminToken, async (req, res) => {
    const { username, email } = req.body;
    const created_by = req.user.id;

    // Input validation
    if (!username || !email) {
        return res.status(400).json({ message: "Username and email are required" });
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
        return res.status(400).json({ message: "Invalid email format" });
    }

    try {
        // Check for existing email in both users and admins tables
        const [existingUsers] = await db.promise().query("SELECT id FROM users WHERE email = ?", [email]);
        const [existingAdmins] = await db.promise().query("SELECT id FROM admins WHERE email = ?", [email]);

        if (existingUsers.length > 0) {
            return res.status(400).json({ message: "Email already exists" });
        }
        if (existingAdmins.length > 0) {
            return res.status(400).json({ message: "Email already exists in admin accounts" });
        }

        const tempPassword = crypto.randomBytes(4).toString("hex");
        const hashedTempPassword = await bcrypt.hash(tempPassword, 10);
        const tempToken = jwt.sign({ email }, "your_jwt_secret", { expiresIn: "24h" });
        const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

        const [result] = await db.promise().query(
            "INSERT INTO users (username, email, temp_password, temp_token, token_expires_at, created_by, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [username, email, hashedTempPassword, tempToken, tokenExpiry, created_by, "pending"]
        );

        const setupLink = `http://localhost:8080/setup-account?token=${tempToken}`;
        const mailOptions = {
            from: "yacobedan@gmail.com",
            to: email,
            subject: "You've Been Invited to Join Our System",
            html: `
                <h3>Hello ${username},</h3>
                <p>You've been invited to join our system by an administrator.</p>
                <p><strong>Here are your temporary credentials:</strong></p>
                <p><b>Username:</b> ${username}</p>
                <p><b>Temporary Password:</b> ${tempPassword}</p>
                <p>Please click the button below to set up your account and choose a permanent password:</p>
                <a href="${setupLink}" style="background: #4361ee; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none; display: inline-block; margin: 10px 0;">Set Up Account</a>
                <p><i>This link will expire in 24 hours. If you don't set up your account by then, you'll need to contact your administrator for a new invitation.</i></p>
                <p>If you didn't expect this invitation, please ignore this email or contact our support team.</p>
                <p>Best regards,<br>The Support Team</p>
            `,
        };

        transporter.sendMail(mailOptions, (error) => {
            if (error) {
                console.error("Email sending error:", error);
                return res.status(500).json({ message: "Email sending failed", error: error.message });
            }
            res.status(201).json({
                message: "User invited successfully",
                userId: result.insertId,
            });
        });
    } catch (error) {
        console.error("Invite error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// 🟢 Update User (Admin-Only Route)
router.put("/users/:id", authenticateAdminToken, async (req, res) => {
    const { id } = req.params;
    const { username, email, status } = req.body;

    // Input validation
    if (!username || !email) {
        return res.status(400).json({ message: "Username and email are required" });
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
        return res.status(400).json({ message: "Invalid email format" });
    }
    if (status && !["pending", "active", "inactive"].includes(status)) {
        return res.status(400).json({ message: "Invalid status value" });
    }

    try {
        const [users] = await db.promise().query("SELECT * FROM users WHERE id = ?", [id]);
        if (users.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        const oldUserData = users[0];
        const changes = {};

        if (oldUserData.username !== username) {
            changes.username = { old: oldUserData.username, new: username };
        }
        if (oldUserData.email !== email) {
            changes.email = { old: oldUserData.email, new: email };
        }
        if (status && oldUserData.status !== status) {
            changes.status = { old: oldUserData.status, new: status };
        }

        // If there are changes, send notification email
        if (Object.keys(changes).length > 0) {
            try {
                let emailText = `Dear ${oldUserData.username},\n\n` +
                               `Your account information has been updated by an administrator.\n\n`;

                if (changes.username) {
                    emailText += `Username changed from "${changes.username.old}" to "${changes.username.new}"\n`;
                }
                if (changes.email) {
                    emailText += `Email changed from "${changes.email.old}" to "${changes.email.new}"\n`;
                }
                if (changes.status) {
                    emailText += `Account status changed from "${changes.status.old}" to "${changes.status.new}"\n`;
                }

                emailText += `\nIf you did not request these changes, please contact support immediately.\n\n` +
                             `Best regards,\nThe Support Team`;

                const mailOptions = {
                    from: "yacobedan@gmail.com",
                    to: oldUserData.email,
                    subject: "Your Account Has Been Updated",
                    text: emailText
                };

                await transporter.sendMail(mailOptions);
            } catch (emailError) {
                console.error("Failed to send update email:", emailError);
                // Continue with update even if email fails
            }
        }

        await db.promise().query(
            "UPDATE users SET username = ?, email = ?, status = ? WHERE id = ?",
            [username, email, status || oldUserData.status, id]
        );

        res.status(200).json({ message: "User updated successfully" });
    } catch (error) {
        console.error("User update error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// 🟢 Delete User (Admin-Only Route)
router.delete("/users/:id", authenticateAdminToken, async (req, res) => {
    const { id } = req.params;

    try {
        const [users] = await db.promise().query("SELECT * FROM users WHERE id = ?", [id]);
        if (users.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        const user = users[0];

        // Send deletion notification email first
        try {
            const mailOptions = {
                from: "yacobedan@gmail.com",
                to: user.email,
                subject: "Your Account Has Been Deleted",
                text: `Dear ${user.username},\n\n` +
                      `Your account has been deleted from our system by an administrator.\n\n` +
                      `You will no longer be able to access our services with this account.\n\n` +
                      `If you believe this was done in error, please contact support immediately.\n\n` +
                      `Best regards,\nThe Support Team`
            };

            await transporter.sendMail(mailOptions);
        } catch (emailError) {
            console.error("Failed to send deletion email:", emailError);
            // Continue with deletion even if email fails
        }

        await db.promise().query("DELETE FROM users WHERE id = ?", [id]);
        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        console.error("User deletion error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// 🟢 Test Route
router.get("/test", authenticateAdminToken, (req, res) => {
    res.json({ message: "Admin router working" });
});

module.exports = router;