import express from 'express';
import { pool } from './../db/db.js';

const router = express.Router();

// 日本電話番号の正規化
function normalizePhone(phone) {
  if (!phone) return '';
  return phone.replace(/[-ー‐—−\s]/g, ''); // 全てのハイフン・空白を除去
}

/**
 * POST /api/reservations
 * イベント予約 API
 */
router.post('/', async (req, res) => {
  try {
    const { event_id, name, email, phone, guest_count } = req.body;

    if (!event_id || !name || !email || !phone) {
      return res
        .status(400)
        .json({ success: false, message: '入力が足りません' });
    }

    // ---- Phone Normalization ----
    const normalizedPhone = normalizePhone(phone);

    // ---- ① 重複予約チェック ----
    const [existing] = await pool.query(
      `SELECT id 
   FROM reservations 
   WHERE event_id = ? 
     AND email = ? 
     AND normalized_phone = ?
     AND status != 'cancelled'
   LIMIT 1`,
      [event_id, email, normalizedPhone],
    );

    if (existing.length > 0) {
      return res.json({
        success: false,
        message: 'このイベントはすでに予約済みです',
      });
    }

    // ---- capacity 取得 ----
    const [[eventInfo]] = await pool.query(
      `SELECT capacity FROM events WHERE id = ? LIMIT 1`,
      [event_id],
    );

    if (!eventInfo) {
      return res
        .status(404)
        .json({ success: false, message: 'イベントが存在しません' });
    }

    const capacity = eventInfo.capacity;

    // ---- 現在の予約人数 ----
    const [[count]] = await pool.query(
      `SELECT COALESCE(SUM(guest_count), 0) AS total
   FROM reservations
   WHERE event_id = ? AND status != 'cancelled'`,
      [event_id],
    );

    const reserved = Number(count.total);

    const guestCountNum = Math.max(1, Number(guest_count));

    // ---- 満席チェック ----
    if (reserved + guestCountNum > capacity) {
      return res.json({
        success: false,
        message: '定員に達しました（これ以上予約できません）',
      });
    }

    // ---- ② 新規 INSERT ----
    const sql = `
        INSERT INTO reservations (
        event_id, name, email, phone, normalized_phone, guest_count, status
        ) VALUES (?, ?, ?, ?, ?, ?, 'reserved')
    `;

    const [result] = await pool.query(sql, [
      event_id,
      name,
      email,
      phone,
      normalizedPhone,
      guestCountNum,
    ]);

    return res.json({
      success: true,
      message: '予約が完了しました',
      reservation_id: result.insertId,
      reservedCount: reserved,
    });
  } catch (err) {
    console.error('Reservation API Error:', err);
    res.status(500).json({ success: false, message: 'サーバーエラー' });
  }
});

export default router;
