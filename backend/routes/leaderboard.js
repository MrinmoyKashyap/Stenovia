import { Router } from 'express';
import { pool } from '../db.js';
const router = Router();

/* ---- top 10 average WPM ---- */
router.get('/', async (_req, res) => {
  const [rows] = await pool.execute(
    `SELECT u.username, ROUND(AVG(t.wpm),1) AS avg_wpm
       FROM users u
       JOIN test_results t ON u.id = t.user_id
      GROUP BY u.id
      ORDER BY avg_wpm DESC
      LIMIT 10`
  );
  res.json(rows);
});
export default router;
