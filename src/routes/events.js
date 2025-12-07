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

/**
 * GET /api/events/:id
 * 根据ID获取单个活动
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // 验证ID是否为数字
    if (isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event ID. ID must be a number.',
      });
    }

    const [rows] = await pool.query('SELECT * FROM events WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    res.json({
      success: true,
      data: rows[0],
    });
  } catch (err) {
    console.error('Error fetching event by ID:', err);
    res.status(500).json({
      success: false,
      message: 'Server Error while fetching event',
    });
  }
});

export default router;
