import { dbAll, dbRun } from '../db/initDb.js';

export async function getNotifications(req, res) {
  try {
    const notifications = await dbAll(
      `SELECT n.*, c.complaintNumber 
       FROM notifications n
       LEFT JOIN complaints c ON n.complaintId = c.id
       ORDER BY n.createdAt DESC LIMIT 30`
    );
    return res.json({ success: true, notifications });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to fetch notifications.' });
  }
}

export async function markAsRead(req, res) {
  try {
    const { id } = req.params;
    await dbRun('UPDATE notifications SET read = 1 WHERE id = ?', [id]);
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to mark notification read.' });
  }
}
