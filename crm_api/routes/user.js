const express = require("express");
const router = express.Router();
const db = require("../db.config/crm_db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

// Centralized error handling
const handleDbError = (res, err) => res.status(500).json({ message: "Database error", error: err });
const handleServerError = (res, err) => res.status(500).json({ message: "Server error", error: err.message });

// Centralized DB query wrapper
const queryPromise = (sql, params) => {
    return new Promise((resolve, reject) => {
        db.query(sql, params, (err, result) => {
            if (err) reject(err);
            else resolve(result);
        });
    });
};

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Access denied. No token provided." });

    try {
        const decoded = jwt.verify(token, "your_jwt_secret");
        req.user = decoded;
        if (req.user.isAdmin) {
            return res.status(403).json({ message: "Access denied. Not a user route." });
        }
        next();
    } catch (error) {
        res.status(403).json({ message: "Invalid token" });
    }
};

// Email configuration
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "yacobedan@gmail.com",
        pass: "vwdgnqgomanftnjv"
    }
});

// 🟢 User Login Route
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email.trim() || !password.trim()) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    try {
        const [users] = await db.promise().query("SELECT * FROM users WHERE email = ?", [email]);
        if (users.length === 0) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password || user.temp_password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        if (user.status !== "active") {
            return res.status(403).json({ message: "Account not active" });
        }

        // Log login activity
        await db.promise().query(
            "INSERT INTO activity_logins (user_id, action, details, ip_address, user_agent) VALUES (?, ?, ?, ?, ?)",
            [
                user.id,
                "login",
                `User ${user.username} logged in`,
                req.ip,
                req.get("User-Agent")
            ]
        );

        const token = jwt.sign(
            { id: user.id, isAdmin: false },
            process.env.JWT_SECRET || "your_jwt_secret",
            { expiresIn: "1h" }
        );
        res.status(200).json({ message: "Login successful", token });
    } catch (error) {
        console.error("User login error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});


// Backend route: /api/user/profile
// app.get('/profile', (req, res) => {
//     const token = req.headers.authorization?.split(' ')[1];
  
//     if (!token) {
//       return res.status(401).json({ message: 'No token provided' });
//     }
  
//     try {
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
//       if (!decoded.isAdmin) {
//         return res.status(200).json({ message: 'User profile', user: decoded });
//       } else {
//         return res.status(403).json({ message: 'Access denied. Admins are not allowed.', expectNotAdmin: false });
//       }
//     } catch (error) {
//       return res.status(401).json({ message: 'Invalid token' });
//     }
//   });

// User profile routes
router.get("/profile", authenticateToken, async (req, res) => {
    try {
        const result = await queryPromise(
            "SELECT username, email FROM users WHERE id = ?",
            [req.user.id]
        );
        if (!result.length) return res.status(404).json({ message: "User not found" });
        res.status(200).json(result[0]);
    } catch (err) {
        handleDbError(res, err);
    }
});

router.put("/profile", authenticateToken, async (req, res) => {
    const { username } = req.body;
    if (!username) return res.status(400).json({ message: "Username is required" });

    try {
        await queryPromise(
            "UPDATE users SET username = ? WHERE id = ?",
            [username, req.user.id]
        );
        res.status(200).json({ message: "Profile updated successfully", user: { username } });
    } catch (err) {
        handleDbError(res, err);
    }
});

// Dashboard routes
const dashboardRoutes = [
    { path: "/stats", query: "SELECT total_purchases, total_spent, rewards_points FROM users WHERE id = ?" },
    { path: "/activity", query: "SELECT id, text, icon, time FROM user_activity WHERE user_id = ? ORDER BY time DESC LIMIT 10" },
    { path: "/insights", query: "SELECT id, title, text, icon, date FROM user_insights WHERE user_id = ? ORDER BY date DESC LIMIT 5" },
    { path: "/notifications", query: "SELECT id, text, icon, time, read FROM user_notifications WHERE user_id = ? ORDER BY time DESC" }
];

dashboardRoutes.forEach(({ path, query }) => {
    router.get(path, authenticateToken, async (req, res) => {
        try {
            const result = await queryPromise(query, [req.user.id]);
            if (path === "/stats" && !result.length) {
                return res.status(404).json({ message: "User not found" });
            }
            res.status(200).json(path === "/stats" && result[0] ? result[0] : result);
        } catch (err) {
            handleDbError(res, err);
        }
    });
});

// Account setup routes
router.get("/setup-account", async (req, res) => {
    const { token } = req.query;
    if (!token) return res.status(400).json({ message: "No token provided" });

    try {
        const decoded = jwt.verify(token, "your_jwt_secret");
        const result = await queryPromise(
            "SELECT * FROM users WHERE email = ? AND temp_token = ?",
            [decoded.email, token]
        );

        if (!result.length || new Date() > new Date(result[0].token_expires_at)) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }
        res.status(200).json({ message: "Token valid. Please provide a new password.", email: decoded.email });
    } catch (error) {
        res.status(400).json({ message: "Invalid token or server error", error: error.message });
    }
});

router.post("/setup-account", async (req, res) => {
    const { token, tempPassword, newPassword, confirmPassword } = req.body;
    if (!token || !tempPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({ message: "All fields are required" });
    }
    if (newPassword !== confirmPassword) {
        return res.status(400).json({ message: "Passwords do not match" });
    }

    try {
        const decoded = jwt.verify(token, "your_jwt_secret");
        const result = await queryPromise(
            "SELECT * FROM users WHERE email = ? AND temp_token = ?",
            [decoded.email, token]
        );

        if (!result.length || new Date() > new Date(result[0].token_expires_at)) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }

        if (!await bcrypt.compare(tempPassword, result[0].temp_password)) {
            return res.status(400).json({ message: "Invalid temporary password" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await queryPromise(
            "UPDATE users SET password = ?, temp_password = NULL, temp_token = NULL, token_expires_at = NULL, status = 'active' WHERE email = ?",
            [hashedPassword, decoded.email]
        );
        res.status(200).json({ message: "Account setup complete. You can now log in." });
    } catch (error) {
        handleServerError(res, error);
    }
});

// Password reset routes
router.post("/forgot-password", async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    try {
        const result = await queryPromise("SELECT * FROM users WHERE email = ?", [email]);
        if (!result.length) return res.status(400).json({ message: "User not found" });

        const resetToken = crypto.randomBytes(32).toString("hex");
        const tokenExpiry = new Date(Date.now() + 3600000); // 1 hour

        await queryPromise(
            "UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE email = ?",
            [resetToken, tokenExpiry, email]
        );

        const resetLink = `http://localhost:5173/reset-password/${resetToken}`;
        await transporter.sendMail({
            from: "yacobedan@gmail.com",
            to: email,
            subject: "Password Reset Request",
            text: `Click the link to reset your password:\n\n${resetLink}\n\nExpires in 1 hour.`
        });

        res.status(200).json({ message: "Password reset link sent." });
    } catch (error) {
        handleServerError(res, error);
    }
});

router.post("/reset-password", async (req, res) => {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
        return res.status(400).json({ message: "Token and new password are required" });
    }

    try {
        const result = await queryPromise("SELECT * FROM users WHERE reset_token = ?", [token]);
        if (!result.length || new Date(result[0].reset_token_expiry) < new Date()) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await queryPromise(
            "UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE reset_token = ?",
            [hashedPassword, token]
        );
        res.status(200).json({ message: "Password reset successful." });
    } catch (error) {
        handleServerError(res, error);
    }
});


// User Statistics Endpoint
router.get('/stats', async (req, res) => {
  try {
    // 1. Get total users count
    const [totalUsersResult] = await db.query('SELECT COUNT(*) as count FROM users');
    const totalUsers = totalUsersResult[0].count;

    // 2. Get active users (last 30 days)
    const thirtyDaysAgo = moment().subtract(30, 'days').format('YYYY-MM-DD HH:mm:ss');
    const [activeUsersResult] = await db.query(
      'SELECT COUNT(*) as count FROM users WHERE last_active_at >= ?',
      [thirtyDaysAgo]
    );
    const activeUsers = activeUsersResult[0].count;

    // 3. Get new users (last 30 days)
    const [newUsersResult] = await db.query(
      'SELECT COUNT(*) as count FROM users WHERE created_at >= ?',
      [thirtyDaysAgo]
    );
    const newUsers = newUsersResult[0].count;

    // 4. Get growth data (monthly registrations for the last 12 months)
    const twelveMonthsAgo = moment().subtract(12, 'months').format('YYYY-MM-DD HH:mm:ss');
    const [growthData] = await db.query(`
      SELECT
        DATE_FORMAT(created_at, '%Y-%m-01') as month,
        COUNT(*) as count
      FROM users
      WHERE created_at >= ?
      GROUP BY month
      ORDER BY month ASC
    `, [twelveMonthsAgo]);

    // Format the growth data for the chart
    const formattedGrowthData = growthData.map(item => ({
      month: moment(item.month).format('MMM YYYY'),
      count: item.count
    }));

    res.json({
      totalUsers,
      activeUsers,
      newUsers,
      growthData: formattedGrowthData
    });

  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ message: 'Failed to fetch user statistics' });
  }
});

// Test route
router.get("/test", (req, res) => res.json({ message: "Users router working" }));

module.exports = router;