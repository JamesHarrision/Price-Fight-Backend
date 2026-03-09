import express from 'express';
import helmet from 'helmet';
import cors from 'cors';

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Test Route
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to Price-Fight',
    status: 'success',
  });
});

export default app;
