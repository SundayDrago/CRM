const express = require('express');
const { PythonShell } = require('python-shell');
const router = express.Router();

// Prediction endpoint
router.post('/predict', (req, res) => {
  const inputData = req.body;

  let options = {
    mode: 'text',
    pythonOptions: ['-u'],
    scriptPath: './scripts',
    args: [JSON.stringify(inputData)]
  };

  PythonShell.run('predict.py', options, (err, results) => {
    if (err) {
      console.error('Error running predict script:', err);
      return res.status(500).json({ error: 'Prediction failed' });
    }
    const predictions = JSON.parse(results[0]);
    res.json(predictions);
  });
});

// Analytics endpoint
router.get('/analytics/:timeRange', (req, res) => {
  const { timeRange } = req.params;

  let options = {
    mode: 'text',
    pythonOptions: ['-u'],
    scriptPath: './scripts',
    args: [timeRange]
  };

  PythonShell.run('analytics.py', options, (err, results) => {
    if (err) {
      console.error('Error running analytics script:', err);
      return res.status(500).json({ error: 'Analytics failed' });
    }
    const analytics = JSON.parse(results[0]);
    res.json(analytics);
  });
});

module.exports = router;