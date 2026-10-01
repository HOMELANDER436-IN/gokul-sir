const express = require('express');
const cors = require('cors');
const path = require('path');

const studentsRouter = require('./routes/students');
const analysisRouter = require('./routes/analysis');
const assessmentToolsRouter = require('./routes/assessmentTools');
const mappingRouter = require('./routes/mapping');
const overallRouter = require('./routes/overall');
const settingsRouter = require('./routes/settings');
const auditRouter = require('./routes/audit');
const exportRouter = require('./routes/export');
const importRouter = require('./routes/import');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Routes
app.use('/api/students', studentsRouter);
app.use('/api/analysis', analysisRouter);
app.use('/api/assessment-tools', assessmentToolsRouter);
app.use('/api/mapping', mappingRouter);
app.use('/api/overall', overallRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/audit', auditRouter);
app.use('/api/export', exportRouter);
app.use('/api/import', importRouter);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'CO Attainment Management System'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]:', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 CO Attainment Backend Server listening on http://localhost:${PORT}`);
});
