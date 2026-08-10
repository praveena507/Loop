import bcrypt from 'bcryptjs';
import { dbAll, dbGet, dbRun } from '../db/initDb.js';

export async function getUsers(req, res) {
  try {
    const users = await dbAll(
      `SELECT id, name, email, role, status, createdAt, updatedAt FROM staff_users ORDER BY createdAt DESC`
    );
    return res.json({ success: true, users });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to fetch staff users.' });
  }
}

export async function createUser(req, res) {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, error: 'Name, email, password, and role are required.' });
    }

    const existing = await dbGet('SELECT * FROM staff_users WHERE LOWER(email) = LOWER(?)', [email.trim()]);
    if (existing) {
      return res.status(400).json({ success: false, error: 'A staff user with this email address already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const now = new Date().toISOString();
    const id = `usr_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

    await dbRun(
      `INSERT INTO staff_users (id, name, email, passwordHash, role, status, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, 'ACTIVE', ?, ?)`,
      [id, name.trim(), email.trim().toLowerCase(), passwordHash, role.toUpperCase(), now, now]
    );

    // Audit log
    await dbRun(
      `INSERT INTO audit_logs (id, userId, action, entity, entityId, ipAddress, createdAt)
       VALUES (?, ?, 'CREATE_STAFF_USER', 'staff_users', id, ?, ?)`,
      [`audit_${Date.now()}`, req.user.id, req.ip || '127.0.0.1', now]
    );

    return res.status(201).json({
      success: true,
      message: 'Staff user created successfully.',
      user: { id, name: name.trim(), email: email.trim().toLowerCase(), role: role.toUpperCase(), status: 'ACTIVE' }
    });

  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to create staff user.' });
  }
}

export async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const { role, status, password } = req.body;
    const now = new Date().toISOString();

    const user = await dbGet('SELECT * FROM staff_users WHERE id = ?', [id]);
    if (!user) return res.status(404).json({ success: false, error: 'Staff user not found.' });

    let sql = 'UPDATE staff_users SET updatedAt = ?';
    const params = [now];

    if (role) {
      sql += ', role = ?';
      params.push(role);
    }
    if (status) {
      sql += ', status = ?';
      params.push(status);
    }
    if (password && password.trim() !== '') {
      const hash = await bcrypt.hash(password, 10);
      sql += ', passwordHash = ?';
      params.push(hash);
    }

    sql += ' WHERE id = ?';
    params.push(id);

    await dbRun(sql, params);

    // Audit log
    await dbRun(
      `INSERT INTO audit_logs (id, userId, action, entity, entityId, ipAddress, createdAt)
       VALUES (?, ?, 'UPDATE_STAFF_USER', 'staff_users', id, ?, ?)`,
      [`audit_${Date.now()}`, req.user.id, req.ip || '127.0.0.1', now]
    );

    return res.json({ success: true, message: 'Staff user updated successfully.' });

  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to update staff user.' });
  }
}

export async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    if (id === req.user.id) {
      return res.status(400).json({ success: false, error: 'You cannot delete your own administrative account.' });
    }

    await dbRun('DELETE FROM staff_users WHERE id = ?', [id]);

    await dbRun(
      `INSERT INTO audit_logs (id, userId, action, entity, entityId, ipAddress, createdAt)
       VALUES (?, ?, 'DELETE_STAFF_USER', 'staff_users', id, ?, ?)`,
      [`audit_${Date.now()}`, req.user.id, req.ip || '127.0.0.1', new Date().toISOString()]
    );

    return res.json({ success: true, message: 'Staff user deleted.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to delete staff user.' });
  }
}

export async function getAuditLogs(req, res) {
  try {
    const logs = await dbAll(
      `SELECT al.*, su.name as userName, su.email as userEmail 
       FROM audit_logs al
       LEFT JOIN staff_users su ON al.userId = su.id
       ORDER BY al.createdAt DESC LIMIT 100`
    );
    return res.json({ success: true, logs });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to fetch audit logs.' });
  }
}

export async function getSettings(req, res) {
  return res.json({
    success: true,
    settings: {
      platformName: 'LOOP AI Intelligence',
      version: '1.0.0',
      slaHours: 24,
      aiModel: 'Gemini 2.5 Flash',
      emailService: 'LOOP Mail Service'
    }
  });
}
