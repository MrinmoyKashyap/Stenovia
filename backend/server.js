import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import testRoutes from './routes/tests.js';
import boardRoutes from './routes/leaderboard.js';
import { pool } from './db.js';  // database connection pool

pool.getConnection()
  .then(() => console.log('Database connected'))
  .catch(err => console.error('Database connection failed:', err));


dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('../public'));      // serves the front-end

app.use('/api/auth',  authRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/board', boardRoutes);

app.get('/api/health', (_req,res)=>res.json({status:'ok'}));
app.listen(process.env.PORT, () =>
  console.log(`API running on http://localhost:${process.env.PORT}`),
);




