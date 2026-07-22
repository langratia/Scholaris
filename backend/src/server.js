require('dotenv').config();
const express = require('express');
const cors = require('cors');

const coreRoutes = require('./modules/core/core.routes');
const admissionsRoutes = require('./modules/admissions/admissions.routes');
const financeRoutes = require('./modules/finance/finance.routes');
const timetablesRoutes = require('./modules/timetables/timetables.routes');
const attendanceRoutes = require('./modules/attendance/attendance.routes');
const examsRoutes = require('./modules/exams/exams.routes');
const assignmentsRoutes = require('./modules/assignments/assignments.routes');
const libraryRoutes = require('./modules/library/library.routes');
const hrRoutes = require('./modules/hr/hr.routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3001;

// Global Middleware
app.use(cors());
app.use(express.json());

// Domain Routes
app.use('/api/core', coreRoutes);
app.use('/api/admissions', admissionsRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/timetables', timetablesRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/exams', examsRoutes);
app.use('/api/assignments', assignmentsRoutes);
app.use('/api/library', libraryRoutes);
app.use('/api/hr', hrRoutes);

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
