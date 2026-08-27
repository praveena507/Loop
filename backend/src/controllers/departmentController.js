import { dbRun, dbGet, dbAll, supabaseQuery } from '../db/initDb.js';

// Get list of active departments
export async function getDepartments(req, res) {
  try {
    const departments = await dbAll('SELECT * FROM departments ORDER BY name ASC');
    return res.json({ success: true, count: departments.length, departments });
  } catch (err) {
    console.error('Get departments error:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch departments.' });
  }
}

// Admin: Create or update department
export async function createOrUpdateDepartment(req, res) {
  try {
    const { id, name, code, description, status } = req.body;
    if (!name || !code) {
      return res.status(400).json({ success: false, error: 'Department name and code are required.' });
    }

    const now = new Date().toISOString();

    if (id) {
      await dbRun(
        'UPDATE departments SET name = ?, code = ?, description = ?, status = ? WHERE id = ?',
        [name.trim(), code.trim().toUpperCase(), description ? description.trim() : '', status || 'ACTIVE', id]
      );
      return res.json({ success: true, message: 'Department updated successfully.' });
    } else {
      const deptId = `dept_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      await dbRun(
        'INSERT INTO departments (id, name, code, description, status, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
        [deptId, name.trim(), code.trim().toUpperCase(), description ? description.trim() : '', status || 'ACTIVE', now]
      );
      return res.status(201).json({ success: true, message: 'Department created successfully.', id: deptId });
    }
  } catch (err) {
    console.error('Create/update department error:', err);
    return res.status(500).json({ success: false, error: 'Failed to save department.' });
  }
}

// Get Department Case Queue (Requests sent to department)
export async function getDepartmentQueue(req, res) {
  try {
    const { departmentName, status } = req.query;

    let sql = `
      SELECT dr.*, 
             c.complaintNumber, c.name as customerName, c.email as customerEmail, c.category as complaintCategory, c.reason, c.description, c.status as complaintStatus,
             su.name as requestedByName,
             rep.id as reportId, rep.investigationResult, rep.evidence, rep.finding, rep.actionTaken, rep.recommendation, rep.submittedAt
      FROM department_requests dr
      JOIN complaints c ON dr.complaintId = c.id
      LEFT JOIN staff_users su ON dr.requestedBy = su.id
      LEFT JOIN department_reports rep ON dr.id = rep.requestId
      WHERE 1=1
    `;
    const params = [];

    if (departmentName) {
      sql += ` AND LOWER(dr.departmentName) = LOWER(?)`;
      params.push(departmentName);
    }

    if (status) {
      sql += ` AND dr.status = ?`;
      params.push(status);
    }

    sql += ` ORDER BY dr.createdAt DESC`;

    const requests = await dbAll(sql, params);
    return res.json({ success: true, count: requests.length, requests });

  } catch (err) {
    console.error('Get department queue error:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch department case queue.' });
  }
}
