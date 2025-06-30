import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../db.js';
import { auth } from '../authMiddleware.js';   // ← NEW

const router = Router();
const SALT  = 10;

/* ------------------------------------------------------------------
   1.  SIGN-UP  →  POST /api/auth/signup
------------------------------------------------------------------ */
router.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password)
    return res.status(400).json({ message: 'All fields required' });

  const [[exists]] = await pool.execute(
    'SELECT id FROM users WHERE email=? OR username=?',
    [email, username],
  );
  if (exists) return res.status(400).json({ message: 'User exists' });

  const hash = await bcrypt.hash(password, SALT);
  const [{ insertId }] = await pool.execute(
    'INSERT INTO users (username,email,password_hash) VALUES (?,?,?)',
    [username, email, hash],
  );

  issueToken(res, insertId, username, email);
});

/* ------------------------------------------------------------------
   2.  LOGIN  →  POST /api/auth/login
------------------------------------------------------------------ */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const [[user]] = await pool.execute(
    'SELECT * FROM users WHERE email=?',
    [email],
  );
  if (!user) return res.status(400).json({ message: 'Bad credentials' });

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(400).json({ message: 'Bad credentials' });

  issueToken(res, user.id, user.username, user.email);
});

/* ------------------------------------------------------------------
   3.  WHO AM I?  →  GET /api/auth/me   (requires JWT)
------------------------------------------------------------------ */
router.get('/me', auth, async (req, res) => {
  const [[row]] = await pool.execute(
    'SELECT id, username, email, created_at FROM users WHERE id=?',
    [req.user.id],
  );
  res.json(row);
});

/* ------------------------------------------------------------------
   Helper: create & send JWT
------------------------------------------------------------------ */
function issueToken(res, id, username, email) {
  const token = jwt.sign(
    { id, username },
    process.env.JWT_SECRET,
    { expiresIn: '7d' },
  );
  res.json({ token, user: { id, username, email } });
}

export default router;
