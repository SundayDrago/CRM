const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware should come **before** defining routes
app.use(cors());
app.use(express.json()); // Parses JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parses form data

// Routes
const crm = require('./routes/crm');
const user = require('./routes/user');
const admin = require("./routes/admin");
const analytics = require('./routes/analytics');

// Use routes after middleware
app.use("/api/admin", admin);
app.use("/api/user", user);
app.use('/api/customers', crm);
app.use('/api', analytics);


app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Customer Segmentation API' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
