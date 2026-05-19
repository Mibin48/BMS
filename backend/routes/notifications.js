const router = require('express').Router();
const pool = require('../config/db');
const { protect } = require('../middleware/auth');

// GET /api/notifications
// Get notifications for current user
router.get('/', protect, async (req, res) => {
  const { limit = 20, offset = 0, unread_only = false } = req.query;
  const user_id = req.user.user_id;

  try {
    const whereClause = unread_only === 'true'
      ? 'WHERE n.user_id = ? AND n.is_read = 0'
      : 'WHERE n.user_id = ?';

    const [rows] = await pool.query(`
      SELECT
        n.notification_id,
        n.type,
        n.title,
        n.message,
        n.link,
        n.is_read,
        n.priority,
        n.created_at,
        n.read_at
      FROM Notification n
      ${whereClause}
      ORDER BY n.created_at DESC
      LIMIT ? OFFSET ?
    `, [user_id, parseInt(limit), parseInt(offset)]);

    const [[{ total }]] = await pool.query(`
      SELECT COUNT(*) as total
      FROM Notification n
      WHERE n.user_id = ?
    `, [user_id]);

    const [[{ unread_count }]] = await pool.query(`
      SELECT COUNT(*) as unread_count
      FROM Notification n
      WHERE n.user_id = ? AND n.is_read = 0
    `, [user_id]);

    res.json({
      success: true,
      data: {
        notifications: rows,
        total,
        unread_count,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/notifications/count
// Just unread count (for badge)
router.get('/count', protect, async (req, res) => {
  try {
    const [[{ count }]] = await pool.query(`
      SELECT COUNT(*) as count
      FROM Notification
      WHERE user_id = ? AND is_read = 0
    `, [req.user.user_id]);

    res.json({ success: true, count });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/notifications/:id/read
// Mark one as read
router.patch('/:id/read', protect, async (req, res) => {
  try {
    await pool.query(`
      UPDATE Notification
      SET is_read = 1, read_at = NOW()
      WHERE notification_id = ? AND user_id = ?
    `, [req.params.id, req.user.user_id]);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/notifications/read-all
// Mark all as read
router.patch('/read-all', protect, async (req, res) => {
  try {
    await pool.query(`
      UPDATE Notification
      SET is_read = 1, read_at = NOW()
      WHERE user_id = ? AND is_read = 0
    `, [req.user.user_id]);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/notifications/:id
// Delete one notification
router.delete('/:id', protect, async (req, res) => {
  try {
    await pool.query(`
      DELETE FROM Notification
      WHERE notification_id = ? AND user_id = ?
    `, [req.params.id, req.user.user_id]);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/notifications/clear-all
// Clear all notifications
router.delete('/clear-all', protect, async (req, res) => {
  try {
    await pool.query(`
      DELETE FROM Notification
      WHERE user_id = ?
    `, [req.user.user_id]);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
