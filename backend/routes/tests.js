import { Router } from 'express';
import { pool } from '../db.js';
import { auth } from '../authMiddleware.js';

const router = Router();

/* ---- save one test ---- */
router.post('/results', auth, async (req, res) => {
  const { wpm, accuracy, testDuration, wordsTyped } = req.body;
  await pool.execute(
    `INSERT INTO test_results (user_id,wpm,accuracy,test_duration,words_typed)
     VALUES (?,?,?,?,?)`,
    [req.user.id, wpm, accuracy, testDuration, wordsTyped],
  );
  res.status(201).json({ message: 'Saved' });
});

/* ---- latest 20 for user ---- */
router.get('/history', auth, async (req, res) => {
  const [rows] = await pool.execute(
    'SELECT * FROM test_results WHERE user_id=? ORDER BY created_at DESC LIMIT 20',
    [req.user.id],
  );
  res.json(rows);
});

export default router;
