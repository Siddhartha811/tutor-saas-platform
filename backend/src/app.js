const authRoutes = require('./routes/authRoutes');
const testRoutes = require('./routes/testRoutes');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();
app.use('/api/test', testRoutes);
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.use('/api/auth', authRoutes);

// Feature routes get mounted here starting Day 3 (auth), Day 5 (students), etc.

app.use(notFound);
app.use(errorHandler);

module.exports = app;