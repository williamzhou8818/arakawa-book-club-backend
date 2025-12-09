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

// GET /api/events/:id/remaining
router.get('/:id/remaining', async (req, res) => {
  try {
    const eventId = req.params.id;

    // capacity 取得
    const [[eventInfo]] = await pool.query(
      `SELECT capacity FROM events WHERE id = ? LIMIT 1`,
      [eventId],
    );

    if (!eventInfo) {
      return res
        .status(404)
        .json({ success: false, message: 'イベントが存在しません' });
    }

    const capacity = Number(eventInfo.capacity);

    // 現在の予約人数
    const [[count]] = await pool.query(
      `SELECT COALESCE(SUM(guest_count), 0) AS total
       FROM reservations
       WHERE event_id = ? AND status != 'cancelled'`,
      [eventId],
    );

    const reserved = Number(count.total);

    return res.json({
      success: true,
      capacity,
      reserved,
      remaining: Math.max(0, capacity - reserved),
    });
  } catch (err) {
    console.error('getRemainingSpots API Error:', err);
    return res.status(500).json({ success: false, message: 'サーバーエラー' });
  }
});

export default router;
