import express from 'express';
import { pool } from './../db/db.js';

const router = express.Router();

/**
 * GET /api/events
 * 获取全部活动
 */
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM events ORDER BY start_time ASC',
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

export default router;
