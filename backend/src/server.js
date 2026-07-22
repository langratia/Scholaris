require('dotenv').config();
const express = require('express');
const cors = require('cors');

const coreRoutes = require('./modules/core/core.routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3001;

// Global Middleware
app.use(cors());
app.use(express.json());

// Domain Routes
app.use('/api/core', coreRoutes);

// Backward Compatibility / Top-level Domain Aliases
app.use('/api', coreRoutes);

// Healthcheck
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', domain: 'scholaris-core', timestamp: new Date().toISOString() });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
  console.log(`🎓 Scholaris API backend running on http://localhost:${PORT}`);
});
