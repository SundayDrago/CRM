// routes/customerSegmentation.js
const express = require('express');
const router = express.Router();

// Dummy data (in the future, you'll connect to a database)
let customers = [
  { id: 1, name: 'John Doe', segment: 'A' },
  { id: 2, name: 'Jane Smith', segment: 'B' },
];

// Get all customers
router.get('/', (req, res) => {
  res.json(customers);
});

// Create a new customer
router.post('/', (req, res) => {
  const { name, segment } = req.body;
  const newCustomer = { id: customers.length + 1, name, segment };
  customers.push(newCustomer);
  res.status(201).json(newCustomer);
});

// Get a single customer by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const customer = customers.find(c => c.id == id);
  if (!customer) {
    return res.status(404).json({ message: 'Customer not found' });
  }
  res.json(customer);
});

// Update customer segment
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { segment } = req.body;
  let customer = customers.find(c => c.id == id);
  if (!customer) {
    return res.status(404).json({ message: 'Customer not found' });
  }
  customer.segment = segment;
  res.json(customer);
});

// Delete a customer
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  customers = customers.filter(c => c.id != id);
  res.status(204).end();
});

module.exports = router;
