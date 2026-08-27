import bcrypt from 'bcryptjs';
import { dbAll, dbGet, dbRun } from '../db/initDb.js';
import { sendAnalystWelcomeEmail } from '../services/emailService.js';

export async function getUsers(req, res) {
  try {
    const users = await dbAll(
      `SELECT id, name, email, plainPassword, role, status, createdAt, updatedAt FROM staff_users ORDER BY createdAt DESC`
    );

    // Compute workload stats for each user
    const usersWithStats = await Promise.all(users.map(async (u) => {
      const assignedActions = await dbAll(
        `SELECT DISTINCT ca1.complaintId 
         FROM complaint_actions ca1
         WHERE ca1.analystId = ? AND ca1.createdAt = (
           SELECT MAX(ca2.createdAt) FROM complaint_actions ca2
           WHERE ca2.complaintId = ca1.complaintId AND ca2.analystId IS NOT NULL
         )`,
        [u.id]
      );
      const totalAssigned = assignedActions.length;
      
      const resolvedActions = await dbAll(
        `SELECT DISTINCT ca1.complaintId 
         FROM complaint_actions ca1
         JOIN complaints c ON ca1.complaintId = c.id 
         WHERE ca1.analystId = ? AND c.status = 'RESOLVED' AND ca1.createdAt = (
           SELECT MAX(ca2.createdAt) FROM complaint_actions ca2
           WHERE ca2.complaintId = ca1.complaintId AND ca2.analystId IS NOT NULL
         )`,
        [u.id]
      );
      const resolvedCount = resolvedActions.length;
      const pendingCount = Math.max(0, totalAssigned - resolvedCount);

      // Count P1/P2 (Critical/High) priority pending complaints
      const highPriorityActions = await dbAll(
        `SELECT DISTINCT ca1.complaintId 
         FROM complaint_actions ca1
         JOIN complaints c ON ca1.complaintId = c.id 
         LEFT JOIN ai_analysis a ON c.id = a.complaintId
         WHERE ca1.analystId = ? AND c.status != 'RESOLVED' AND a.priority IN ('CRITICAL', 'HIGH') AND ca1.createdAt = (
           SELECT MAX(ca2.createdAt) FROM complaint_actions ca2
           WHERE ca2.complaintId = ca1.complaintId AND ca2.analystId IS NOT NULL
         )`,
        [u.id]
      );
      const highPriorityCount = highPriorityActions.length;

      const lastAct = await dbGet(
        'SELECT createdAt FROM complaint_actions WHERE analystId = ? ORDER BY createdAt DESC LIMIT 1',
        [u.id]
      );

      // Operational workload capacity estimate (capped at 15 max active threshold)
      const workloadPercentage = Math.min(100, Math.round((pendingCount / 15) * 100));

      return {
        ...u,
        totalAssigned,
        pendingCount,
        resolvedCount,
        highPriorityCount,
        workloadPercentage,
        lastActivity: lastAct ? lastAct.createdAt : u.createdAt
      };
    }));

    return res.json({ success: true, users: usersWithStats });
  } catch (err) {
    console.error('getUsers error:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch staff users.' });
  }
}

export async function assignComplaint(req, res) {
  try {
    const { id } = req.params;
    const { analystId } = req.body;
    const adminId = req.user ? req.user.id : null;

    const complaint = await dbGet('SELECT * FROM complaints WHERE id = ? OR complaintNumber = ?', [id, id]);
    if (!complaint) {
      return res.status(404).json({ success: false, error: 'Complaint not found.' });
    }

    let analyst = null;
    if (analystId) {
      analyst = await dbGet('SELECT * FROM staff_users WHERE id = ?', [analystId]);
      if (!analyst) {
        return res.status(404).json({ success: false, error: 'Target staff analyst not found.' });
      }
    }

    const now = new Date().toISOString();
    const actionId = `act_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const actionText = analyst ? `ASSIGNED_TO_${analyst.name.toUpperCase().replace(/\s+/g, '_')}` : 'REASSIGNED';
    const notesText = analyst ? `Assigned to analyst: ${analyst.name} (${analyst.email})` : 'Unassigned by Admin';

    await dbRun(
      'INSERT INTO complaint_actions (id, complaintId, analystId, action, notes, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
      [actionId, complaint.id, analystId || null, actionText, notesText, now]
    );

    let newStatus = complaint.status;
    if (analystId && (complaint.status === 'SUBMITTED' || complaint.status === 'VERIFIED' || complaint.status === 'AI_ANALYZED')) {
      newStatus = 'IN_PROGRESS';
      await dbRun('UPDATE complaints SET status = ?, updatedAt = ? WHERE id = ?', [newStatus, now, complaint.id]);
    }

    if (analystId) {
      const notifId = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      await dbRun(
        'INSERT INTO notifications (id, userId, complaintId, type, message, read, createdAt) VALUES (?, ?, ?, ?, ?, 0, ?)',
        [notifId, analystId, complaint.id, 'ASSIGNMENT', `Complaint ${complaint.complaintNumber} has been assigned to you for review.`, now]
      );
    }

    await dbRun(
      `INSERT INTO audit_logs (id, userId, action, entity, entityId, ipAddress, createdAt)
       VALUES (?, ?, 'ASSIGN_COMPLAINT', 'complaints', ?, ?, ?)`,
      [`audit_${Date.now()}`, adminId, complaint.id, req.ip || '127.0.0.1', now]
    );

    return res.json({
      success: true,
      message: analyst ? `Complaint ${complaint.complaintNumber} assigned to ${analyst.name}.` : 'Complaint reassigned.',
      assignedAnalystId: analystId,
      status: newStatus
    });
  } catch (err) {
    console.error('Assign complaint error:', err);
    return res.status(500).json({ success: false, error: 'Failed to assign complaint.' });
  }
}

export async function createUser(req, res) {
  try {
    const { name, email, password, role, sendEmailNotification = true } = req.body;
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
      `INSERT INTO staff_users (id, name, email, passwordHash, plainPassword, role, status, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE', ?, ?)`,
      [id, name.trim(), email.trim().toLowerCase(), passwordHash, password, role.toUpperCase(), now, now]
    );

    // Dispatch welcome email with credentials
    if (sendEmailNotification) {
      await sendAnalystWelcomeEmail({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: password,
        role: role.toUpperCase()
      });
    }

    // Audit log
    await dbRun(
      `INSERT INTO audit_logs (id, userId, action, entity, entityId, ipAddress, createdAt)
       VALUES (?, ?, 'CREATE_STAFF_USER', 'staff_users', ?, ?, ?)`,
      [`audit_${Date.now()}`, req.user ? req.user.id : id, id, req.ip || '127.0.0.1', now]
    );

    return res.status(201).json({
      success: true,
      message: `Staff account (${role}) created and credentials email dispatched to ${email}.`,
      user: { id, name: name.trim(), email: email.trim().toLowerCase(), role: role.toUpperCase(), status: 'ACTIVE', plainPassword: password }
    });

  } catch (err) {
    console.error('createUser error:', err);
    return res.status(500).json({ success: false, error: 'Failed to create staff user.' });
  }
}

export async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const { role, status, password, sendCredentialsEmail } = req.body;
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
      sql += ', passwordHash = ?, plainPassword = ?';
      params.push(hash, password.trim());
    }

    sql += ' WHERE id = ?';
    params.push(id);

    await dbRun(sql, params);

    if (sendCredentialsEmail || password) {
      const activePassword = password || user.plainPassword || 'Analyst@12345';
      await sendAnalystWelcomeEmail({
        name: user.name,
        email: user.email,
        password: activePassword,
        role: role || user.role
      });
    }

    // Audit log
    await dbRun(
      `INSERT INTO audit_logs (id, userId, action, entity, entityId, ipAddress, createdAt)
       VALUES (?, ?, 'UPDATE_STAFF_USER', 'staff_users', ?, ?, ?)`,
      [`audit_${Date.now()}`, req.user ? req.user.id : user.id, id, req.ip || '127.0.0.1', now]
    );

    return res.json({ success: true, message: 'Staff user updated successfully.' });

  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to update staff user.' });
  }
}

export async function resendAnalystCredentials(req, res) {
  try {
    const { id } = req.params;
    const user = await dbGet('SELECT * FROM staff_users WHERE id = ?', [id]);
    if (!user) return res.status(404).json({ success: false, error: 'Staff analyst account not found.' });

    const activePassword = user.plainPassword || 'Analyst@12345';
    await sendAnalystWelcomeEmail({
      name: user.name,
      email: user.email,
      password: activePassword,
      role: user.role
    });

    return res.json({
      success: true,
      message: `Account credentials email successfully re-dispatched to ${user.email}.`
    });
  } catch (err) {
    console.error('resendAnalystCredentials error:', err);
    return res.status(500).json({ success: false, error: 'Failed to dispatch analyst credentials email.' });
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
       VALUES (?, ?, 'DELETE_STAFF_USER', 'staff_users', ?, ?, ?)`,
      [`audit_${Date.now()}`, req.user.id, id, req.ip || '127.0.0.1', new Date().toISOString()]
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
      platformName: 'LOOP Intelligence',
      version: '1.0.0',
      slaHours: 24,
      aiModel: 'Automated Intelligence Engine',
      emailService: 'LOOP Mail Service'
    }
  });
}
