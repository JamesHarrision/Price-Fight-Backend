import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { prisma } from './config/prisma.config';
import authRoutes from './routes/auth.route';
import itemRoutes from './routes/item.route';
import eventRoutes from './routes/event.route'
import userRoutes from './routes/user.route'

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

//Routes
app.use('/api/auth', authRoutes);
app.use('/api', itemRoutes);
app.use('/api/events', eventRoutes)
app.use('/api/users', userRoutes);

// Test Route
app.get('/', async (req, res) => {
  try {
    const userCount = await prisma.user.count();
    res.status(200).json({
      message: 'Welcome to Price-Fight',
      database: 'Connected to MySQL',
      userCount: userCount,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Database connection failed',
      error: error,
    });
  }
});

export default app;
