import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/auth.js';
import equipmentRoutes from './routes/equipment.js';
import categoriesRoutes from './routes/categories.js';
import locationsRoutes from './routes/locations.js';
import suppliersRoutes from './routes/suppliers.js';
import borrowsRoutes from './routes/borrows.js';
import maintenanceRoutes from './routes/maintenance.js';
import inventoryRoutes from './routes/inventory.js';
import statsRoutes from './routes/stats.js';
import usersRoutes from './routes/users.js';
import { authenticate } from './middleware/auth.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/equipment', authenticate, equipmentRoutes);
app.use('/api/categories', authenticate, categoriesRoutes);
app.use('/api/locations', authenticate, locationsRoutes);
app.use('/api/suppliers', authenticate, suppliersRoutes);
app.use('/api/borrows', authenticate, borrowsRoutes);
app.use('/api/maintenance', authenticate, maintenanceRoutes);
app.use('/api/inventory', authenticate, inventoryRoutes);
app.use('/api/stats', authenticate, statsRoutes);
app.use('/api/users', authenticate, usersRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use(errorHandler);

// Start
async function start() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

start();
