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
    if (!token) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret");
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
        user: process.env.EMAIL_USER || "yacobedan@gmail.com",
        pass: process.env.EMAIL_PASS || "qdbdgryrzwodqksg",
    },
});

// Notification endpoint
router.post("/users/send-notification", authenticateAdminToken, async (req, res) => {
    try {
        const { email, type, changes, userId } = req.body;
        if (!email || !type) {
            return res.status(400).json({ message: "Email and type are required" });
        }

        let mailOptions;
        let subject;
        let text;

        switch (type) {
            case "account_updated":
                subject = "Your Account Has Been Updated";
                text = `Dear user,\n\n`;
                text += `Your account information has been updated by an administrator.\n\n`;

                if (changes?.username) {
                    text += `Username changed from "${changes.username.old}" to "${changes.username.new}"\n`;
                }
                if (changes?.email) {
                    text += `Email changed from "${changes.email.old}" to "${changes.email.new}"\n`;
                }

                text += `\nIf you did not request these changes, please contact support immediately.\n\n`;
                text += `Best regards,\nThe Support Team`;
                break;

            case "account_deleted":
                subject = "Your Account Has Been Deleted";
                text = `Dear user,\n\n`;
                text += `Your account has been deleted from our system by an administrator.\n\n`;
                text += `You will no longer be able to access our services with this account.\n\n`;
                text += `If you believe this was done in error, please contact support immediately.\n\n`;
                text += `Best regards,\nThe Support Team`;
                break;

            default:
                return res.status(400).json({ message: "Invalid notification type" });
        }

        mailOptions = {
            from: process.env.EMAIL_FROM || "yacobedan@gmail.com",
            to: email,
            subject: subject,
            text: text,
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: "Notification sent successfully" });
    } catch (error) {
        console.error("Error sending notification:", error);
        res.status(500).json({ message: "Failed to send notification", error: error.message });
    }
});

// Admin Login
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

        const token = jwt.sign(
            { id: admin.id, isAdmin: true },
            process.env.JWT_SECRET || "your_jwt_secret",
            { expiresIn: "1h" }
        );
        res.status(200).json({ message: "Login successful", token, redirect: "/admin" });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// Admin Registration
router.post("/register", async (req, res) => {
    const { full_name, username, email, password, confirmPassword } = req.body;

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
                message: existingAdmins[0].email === email ? "Email already exists" : "Username already exists",
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
            from: process.env.EMAIL_FROM || "yacobedan@gmail.com",
            to: email,
            subject: "Admin Security Code - CRM System",
            text: `Hello ${full_name},\n\nYour security code is: ${securityCode}.\n\nPlease enter this code to verify your email.\n\nThank you!`,
        };

        await transporter.sendMail(mailOptions);
        res.status(201).json({ message: "Admin registered. Check your email for the security code." });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// Admin Security Code Verification
router.post("/verify-security-code", async (req, res) => {
    const { email, securityCode } = req.body;

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

// Get Admin Profile (used as /api/auth/me)
router.get("/profile", authenticateAdminToken, async (req, res) => {
    const adminId = req.user.id;

    try {
        const [admins] = await db.promise().query(
            "SELECT id, full_name AS name, username, email, avatar FROM admins WHERE id = ?",
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

// Update Admin Profile
router.put("/profile", authenticateAdminToken, async (req, res) => {
    const adminId = req.user.id;
    const { name, email } = req.body;

    if (!name || !email) {
        return res.status(400).json({ message: "Full name and email are required" });
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
        return res.status(400).json({ message: "Invalid email format" });
    }

    try {
        const [existingAdmins] = await db.promise().query(
            "SELECT id FROM admins WHERE email = ? AND id != ?",
            [email, adminId]
        );
        const [existingUsers] = await db.promise().query("SELECT id FROM users WHERE email = ?", [email]);

        if (existingAdmins.length > 0) {
            return res.status(400).json({ message: "Email already exists" });
        }
        if (existingUsers.length > 0) {
            return res.status(400).json({ message: "Email already exists in user accounts" });
        }

        await db.promise().query(
            "UPDATE admins SET full_name = ?, email = ? WHERE id = ?",
            [name, email, adminId]
        );

        res.status(200).json({ message: "Profile updated successfully" });
    } catch (error) {
        console.error("Profile update error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// Update Admin Password
router.put("/password", authenticateAdminToken, async (req, res) => {
    const adminId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Current and new passwords are required" });
    }
    if (newPassword.length < 8) {
        return res.status(400).json({ message: "New password must be at least 8 characters long" });
    }

    try {
        const [admins] = await db.promise().query("SELECT password FROM admins WHERE id = ?", [adminId]);
        if (admins.length === 0) {
            return res.status(404).json({ message: "Admin not found" });
        }

        const isMatch = await bcrypt.compare(currentPassword, admins[0].password);
        if (!isMatch) {
            return res.status(400).json({ message: "Current password is incorrect" });
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        await db.promise().query("UPDATE admins SET password = ? WHERE id = ?", [
            hashedNewPassword,
            adminId,
        ]);

        res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
        console.error("Password update error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// Get All Users (Admin-Only)
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

// Invite User (Admin-Only)
router.post("/users/invite", authenticateAdminToken, async (req, res) => {
    const { username, email } = req.body;
    const created_by = req.user.id;

    if (!username || !email) {
        return res.status(400).json({ message: "Username and email are required" });
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
        return res.status(400).json({ message: "Invalid email format" });
    }

    try {
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
        const tempToken = jwt.sign({ email }, process.env.JWT_SECRET || "your_jwt_secret", {
            expiresIn: "24h",
        });
        const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

        const [result] = await db.promise().query(
            "INSERT INTO users (username, email, temp_password, temp_token, token_expires_at, created_by, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [username, email, hashedTempPassword, tempToken, tokenExpiry, created_by, "pending"]
        );

        const setupLink = `http://localhost:8080/setup-account?token=${tempToken}`;
        const mailOptions = {
            from: process.env.EMAIL_FROM || "yacobedan@gmail.com",
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

        await transporter.sendMail(mailOptions);
        res.status(201).json({
            message: "User invited successfully",
            userId: result.insertId,
        });
    } catch (error) {
        console.error("Invite error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// Update User (Admin-Only)
router.put("/users/:id", authenticateAdminToken, async (req, res) => {
    const { id } = req.params;
    const { username, email, status } = req.body;

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
                    from: process.env.EMAIL_FROM || "yacobedan@gmail.com",
                    to: oldUserData.email,
                    subject: "Your Account Has Been Updated",
                    text: emailText,
                };

                await transporter.sendMail(mailOptions);
            } catch (emailError) {
                console.error("Failed to send update email:", emailError);
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

// Delete User (Admin-Only)
router.delete("/users/:id", authenticateAdminToken, async (req, res) => {
    const { id } = req.params;

    try {
        const [users] = await db.promise().query("SELECT * FROM users WHERE id = ?", [id]);
        if (users.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        const user = users[0];

        try {
            const mailOptions = {
                from: process.env.EMAIL_FROM || "yacobedan@gmail.com",
                to: user.email,
                subject: "Your Account Has Been Deleted",
                text: `Dear ${user.username},\n\n` +
                    `Your account has been deleted from our system by an administrator.\n\n` +
                    `You will no longer be able to access our services with this account.\n\n` +
                    `If you believe this was done in error, please contact support immediately.\n\n` +
                    `Best regards,\nThe Support Team`,
            };

            await transporter.sendMail(mailOptions);
        } catch (emailError) {
            console.error("Failed to send deletion email:", emailError);
        }

        await db.promise().query("DELETE FROM users WHERE id = ?", [id]);
        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        console.error("User deletion error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// Test Route
router.get("/test", authenticateAdminToken, (req, res) => {
    res.json({ message: "Admin router working" });
});

// Forgot Password Endpoint
router.post("/forgot-password", async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }

    try {
        const [admins] = await db.promise().query("SELECT id, email FROM admins WHERE email = ?", [email]);
        const [users] = await db.promise().query("SELECT id, email FROM users WHERE email = ?", [email]);

        if (admins.length === 0 && users.length === 0) {
            return res.status(404).json({ message: "Email not found" });
        }

        const isAdmin = admins.length > 0;
        const userId = isAdmin ? admins[0].id : users[0].id;
        const table = isAdmin ? "admins" : "users";

        const resetToken = crypto.randomBytes(20).toString("hex");
        const tokenExpiry = new Date(Date.now() + 3600000);

        await db.promise().query(
            `UPDATE ${table} SET reset_token = ?, reset_token_expiry = ? WHERE id = ?`,
            [resetToken, tokenExpiry, userId]
        );

        const resetLink = `http://localhost:8080/reset-password/${resetToken}`;
        const mailOptions = {
            from: process.env.EMAIL_FROM || "yacobedan@gmail.com",
            to: email,
            subject: "Password Reset Request",
            html: `
                <h3>Reset Your Password</h3>
                <p>You requested a password reset for your account.</p>
                <p>Click the button below to reset your password:</p>
                <a href="${resetLink}" style="background: #007bff; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none; display: inline-block; margin: 10px 0;">Reset Password</a>
                <p><i>This link will expire in 1 hour. If you did not request this, please ignore this email.</i></p>
                <p>Best regards,<br>The Support Team</p>
            `,
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: "A reset link has been sent to your email." });
    } catch (error) {
        console.error("Forgot Password Error:", error);
        res.status(500).json({ message: "Failed to send reset link", error: error.message });
    }
});

// Reset Password Endpoint
router.post("/reset-password", async (req, res) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
        return res.status(400).json({ message: "Token and new password are required" });
    }
    if (newPassword.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters long" });
    }

    try {
        const [admins] = await db.promise().query(
            "SELECT id, reset_token_expiry FROM admins WHERE reset_token = ?",
            [token]
        );
        const [users] = await db.promise().query(
            "SELECT id, reset_token_expiry FROM users WHERE reset_token = ?",
            [token]
        );

        let userId, table;
        if (admins.length > 0) {
            userId = admins[0].id;
            table = "admins";
            if (new Date(admins[0].reset_token_expiry) < new Date()) {
                return res.status(400).json({ message: "Reset token has expired" });
            }
        } else if (users.length > 0) {
            userId = users[0].id;
            table = "users";
            if (new Date(users[0].reset_token_expiry) < new Date()) {
                return res.status(400).json({ message: "Reset token has expired" });
            }
        } else {
            return res.status(400).json({ message: "Invalid reset token" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await db.promise().query(
            `UPDATE ${table} SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?`,
            [hashedPassword, userId]
        );

        res.status(200).json({ message: "Password reset successfully" });
    } catch (error) {
        console.error("Reset Password Error:", error);
        res.status(500).json({ message: "Failed to reset password", error: error.message });
    }
});

// Updated Admin User Statistics Endpoint (MySQL compatible)
router.get("/stats", authenticateAdminToken, async (req, res) => {
console.log("Stats endpoint reached!");
    const createdBy = req.user.id;

    try {
        // MySQL-compatible queries
        const [stats] = await db.promise().query(
            `SELECT
                COUNT(*) AS totalUsersCreated,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pendingUsers,
                SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) AS inactiveUsers,
                SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) AS activeUsers
            FROM users
            WHERE created_by = ?`,
            [createdBy]
        );

        const [growthData] = await db.promise().query(
            `SELECT
                DATE_FORMAT(created_at, '%Y-%m') AS month,
                COUNT(*) AS count
            FROM users
            WHERE created_by = ?
            GROUP BY month
            ORDER BY month ASC`,
            [createdBy]
        );

        res.status(200).json({
            totalUsersCreated: stats[0].totalUsersCreated || 0,
            pendingUsers: stats[0].pendingUsers || 0,
            inactiveUsers: stats[0].inactiveUsers || 0,
            activeUsers: stats[0].activeUsers || 0,
            growthData: growthData
        });
    } catch (error) {
        console.error("Stats error:", error);
        res.status(500).json({
            message: "Failed to fetch statistics",
            error: error.message
        });
    }
});


// Add this route to your existing backend router
router.post('/reports/send-email', authenticateAdminToken, async (req, res) => {
    try {
        const { report_id, recipients, subject, message, include_pdf, include_excel } = req.body;

        // Validate input
        if (!report_id || !recipients || !Array.isArray(recipients) || recipients.length === 0) {
            return res.status(400).json({ error: 'Invalid recipients list' });
        }

        // Get report details from database
        const [reports] = await db.promise().query(
            'SELECT * FROM reports WHERE id = ?',
            [report_id]
        );

        if (reports.length === 0) {
            return res.status(404).json({ error: 'Report not found' });
        }

        const report = reports[0];
        
        // Prepare attachments
        const attachments = [];
        
        if (include_pdf) {
            attachments.push({
                filename: `${report.title}.pdf`,
                path: `./reports/${report.id}.pdf`, // Adjust path as needed
                contentType: 'application/pdf'
            });
        }
        
        if (include_excel) {
            attachments.push({
                filename: `${report.title}.xlsx`,
                path: `./reports/${report.id}.xlsx`, // Adjust path as needed
                contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });
        }

        // Check if at least one attachment is included
        if (attachments.length === 0) {
            return res.status(400).json({ error: 'No attachment format selected' });
        }

        // Prepare email content
        const emailContent = {
            from: process.env.EMAIL_FROM || 'yacobedan@gmail.com',
            to: recipients.join(', '),
            subject: subject || `${report.title} - ${report.type} Report`,
            text: message || `Please find attached the ${report.title} report.`,
            html: `
                <h2>${report.title}</h2>
                <p>${message || `Please find attached the ${report.title} report.`}</p>
                <p><strong>Report Details:</strong></p>
                <ul>
                    <li>Type: ${report.type}</li>
                    <li>Generated: ${new Date(report.generated_at).toLocaleString()}</li>
                </ul>
                <p>Best regards,<br>Your Team</p>
            `,
            attachments: attachments
        };

        // Send email
        await transporter.sendMail(emailContent);
        
        // Log the email sending in database
        await db.promise().query(
            'INSERT INTO report_emails (report_id, sent_by, recipients, subject, sent_at) VALUES (?, ?, ?, ?, NOW())',
            [report.id, req.user.id, recipients.join(', '), emailContent.subject]
        );

        res.status(200).json({ 
            success: true,
            message: 'Report sent successfully'
        });
    } catch (error) {
        console.error('Error sending report email:', error);
        res.status(500).json({ 
            error: 'Failed to send email',
            details: error.message
        });
    }
});

module.exports = router;