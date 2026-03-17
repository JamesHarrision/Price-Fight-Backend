import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { startCronJobs } from './jobs/cron';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);

  startCronJobs();
});
