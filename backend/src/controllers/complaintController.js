import { dbRun, dbGet, dbAll, supabaseQuery } from '../db/initDb.js';
import { sendResolutionEmail } from '../services/emailService.js';

export async function createComplaint(req, res) {
  try {
    const { name, email, place, category, reason, description, attachmentUrl } = req.body;

    if (!name || !email || !place || !reason) {
      return res.status(400).json({ success: false, error: 'Name, email, place, and reason are required.' });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const now = new Date().toISOString();

    // 1. Ensure Customer record exists
    let customer = await dbGet('SELECT * FROM customers WHERE LOWER(email) = ?', [trimmedEmail]);
    if (!customer) {
      const custId = `cust_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      await dbRun(
        `INSERT INTO customers (id, name, email, emailVerified, createdAt, updatedAt) VALUES (?, ?, ?, 0, ?, ?)`,
        [custId, name.trim(), trimmedEmail, now, now]
      );
      customer = { id: custId, name: name.trim(), email: trimmedEmail };
    }

    // 2. Generate unique Complaint ID & Reference Number
    const complaintId = `cmp_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const random6 = Math.floor(100000 + Math.random() * 900000);
    const complaintNumber = `LOOP-${new Date().getFullYear()}-${random6}`;

    const complaintData = {
      id: complaintId,
      complaintNumber,
      customerId: customer.id,
      name: name.trim(),
      email: trimmedEmail,
      place: place.trim(),
      category: category || 'Service',
      reason: reason.trim(),
      description: description ? description.trim() : '',
      attachmentUrl: attachmentUrl || '',
      status: 'SUBMITTED',
      createdAt: now,
      updatedAt: now
    };

    // Insert into local DB
    await dbRun(
      `INSERT INTO complaints (id, complaintNumber, customerId, name, email, place, category, reason, description, attachmentUrl, status, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        complaintData.id,
        complaintData.complaintNumber,
        complaintData.customerId,
        complaintData.name,
        complaintData.email,
        complaintData.place,
        complaintData.category,
        complaintData.reason,
        complaintData.description,
        complaintData.attachmentUrl,
        complaintData.status,
        now,
        now
      ]
    );

    // Sync to Supabase complaints table & append complaint_status_history
    await supabaseQuery.insertComplaint(complaintData);
    await supabaseQuery.updateComplaintStatus(complaintId, 'SUBMITTED');

    return res.status(201).json({
      success: true,
      message: 'Complaint created successfully. Email verification required.',
      complaint: {
        id: complaintId,
        complaintNumber,
        email: trimmedEmail,
        status: 'SUBMITTED'
      }
    });

  } catch (err) {
    console.error('Create complaint error:', err);
    return res.status(500).json({ success: false, error: 'Failed to submit complaint.' });
  }
}

export async function trackComplaint(req, res) {
  try {
    const { complaintNumber, email } = req.query;

    if (!complaintNumber) {
      return res.status(400).json({ success: false, error: 'Complaint Number / Reference ID is required.' });
    }

    let complaint = null;
    if (email) {
      complaint = await dbGet(
        'SELECT * FROM complaints WHERE complaintNumber = ? AND LOWER(email) = LOWER(?)',
        [complaintNumber.trim(), email.trim()]
      );
    } else {
      complaint = await dbGet(
        'SELECT * FROM complaints WHERE complaintNumber = ? OR id = ?',
        [complaintNumber.trim(), complaintNumber.trim()]
      );
    }

    if (!complaint) {
      return res.status(404).json({ success: false, error: 'No complaint found matching the reference details provided.' });
    }

    // Query response
    const response = await dbGet('SELECT * FROM responses WHERE complaintId = ?', [complaint.id]);

    // Query status history steps
    const statusHistory = await dbAll(
      'SELECT status, createdAt FROM complaint_status_history WHERE complaintId = ? ORDER BY createdAt ASC',
      [complaint.id]
    );

    // Privacy Isolation Guarantee: Exclude internal staff info, DB IDs, and internal notes
    const publicData = {
      complaintNumber: complaint.complaintNumber,
      place: complaint.place,
      category: complaint.category,
      reason: complaint.reason,
      description: complaint.description,
      attachmentUrl: complaint.attachmentUrl,
      status: complaint.status,
      createdAt: complaint.createdAt,
      updatedAt: complaint.updatedAt,
      statusHistory: statusHistory.length > 0 ? statusHistory : [{ status: complaint.status, createdAt: complaint.createdAt }],
      response: response ? {
        responseText: response.responseText,
        sentAt: response.sentAt,
        senderLabel: 'LOOP Support Team'
      } : null
    };

    return res.json({
      success: true,
      complaint: publicData
    });

  } catch (err) {
    console.error('Track complaint error:', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve tracking details.' });
  }
}

export async function getStaffComplaints(req, res) {
  try {
    const { status, category, priority, search } = req.query;

    let sql = `
      SELECT c.*, 
             a.sentiment, a.sentimentScore, a.category as aiCategory, a.theme, 
             a.priority, a.priorityScore, a.summary as aiSummary, a.attachmentSummary, a.proofMatch, a.rootCause, a.sectionName
      FROM complaints c
      LEFT JOIN ai_analysis a ON c.id = a.complaintId
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      sql += ` AND c.status = ?`;
      params.push(status);
    }

    if (category) {
      sql += ` AND c.category = ?`;
      params.push(category);
    }

    if (priority) {
      sql += ` AND a.priority = ?`;
      params.push(priority);
    }

    if (search) {
      sql += ` AND (c.complaintNumber LIKE ? OR c.name LIKE ? OR c.email LIKE ? OR c.reason LIKE ?)`;
      const term = `%${search.trim()}%`;
      params.push(term, term, term, term);
    }

    sql += ` ORDER BY c.createdAt DESC`;

    const complaints = await dbAll(sql, params);
    return res.json({ success: true, count: complaints.length, complaints });

  } catch (err) {
    console.error('Get staff complaints error:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch complaints list.' });
  }
}

export async function getStaffComplaintById(req, res) {
  try {
    const { id } = req.params;

    const complaint = await dbGet('SELECT * FROM complaints WHERE id = ? OR complaintNumber = ?', [id, id]);
    if (!complaint) {
      return res.status(404).json({ success: false, error: 'Complaint not found.' });
    }

    const aiAnalysis = await dbGet('SELECT * FROM ai_analysis WHERE complaintId = ?', [complaint.id]);
    const actions = await dbAll(
      `SELECT ca.*, su.name as analystName 
       FROM complaint_actions ca 
       LEFT JOIN staff_users su ON ca.analystId = su.id 
       WHERE ca.complaintId = ? 
       ORDER BY ca.createdAt DESC`,
      [complaint.id]
    );
    const response = await dbGet('SELECT * FROM responses WHERE complaintId = ?', [complaint.id]);

    return res.json({
      success: true,
      complaint,
      aiAnalysis,
      actions,
      response
    });

  } catch (err) {
    console.error('Get complaint detail error:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch complaint detail.' });
  }
}

export async function recordComplaintAction(req, res) {
  try {
    const { id } = req.params;
    const { action, notes, status, priority, suggestedResponse } = req.body;
    const analystId = req.user ? req.user.id : null;

    const complaint = await dbGet('SELECT * FROM complaints WHERE id = ? OR complaintNumber = ?', [id, id]);
    if (!complaint) {
      return res.status(404).json({ success: false, error: 'Complaint not found.' });
    }

    const now = new Date().toISOString();
    const actionId = `act_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

    const actionData = {
      id: actionId,
      complaintId: complaint.id,
      analystId,
      action: action || 'ANALYST_REVIEWED',
      notes: notes || '',
      createdAt: now
    };

    // Insert into local DB
    await dbRun(
      `INSERT INTO complaint_actions (id, complaintId, analystId, action, notes, createdAt) VALUES (?, ?, ?, ?, ?, ?)`,
      [actionData.id, actionData.complaintId, actionData.analystId, actionData.action, actionData.notes, now]
    );

    // Sync to Supabase analyst_actions
    await supabaseQuery.insertAnalystAction(actionData);

    let newStatus = complaint.status;
    if (status && status !== complaint.status) {
      newStatus = status;
      await dbRun('UPDATE complaints SET status = ?, updatedAt = ? WHERE id = ?', [newStatus, now, complaint.id]);
      await supabaseQuery.updateComplaintStatus(complaint.id, newStatus);
    }

    if (priority) {
      await dbRun('UPDATE ai_analysis SET priority = ?, updatedAt = ? WHERE complaintId = ?', [priority, now, complaint.id]);
    }

    if (suggestedResponse) {
      await dbRun('UPDATE ai_analysis SET suggestedResponse = ?, updatedAt = ? WHERE complaintId = ?', [suggestedResponse, now, complaint.id]);
    }

    return res.json({
      success: true,
      message: 'Analyst action recorded successfully.',
      status: newStatus
    });

  } catch (err) {
    console.error('Record action error:', err);
    return res.status(500).json({ success: false, error: 'Failed to record analyst action.' });
  }
}

export async function resolveComplaintAndRespond(req, res) {
  try {
    const { id } = req.params;
    const { responseText, notes } = req.body;
    const analystId = req.user ? req.user.id : null;

    if (!responseText || !responseText.trim()) {
      return res.status(400).json({ success: false, error: 'Response text is required.' });
    }

    const complaint = await dbGet('SELECT * FROM complaints WHERE id = ? OR complaintNumber = ?', [id, id]);
    if (!complaint) {
      return res.status(404).json({ success: false, error: 'Complaint not found.' });
    }

    const now = new Date().toISOString();

    // 1. Save or Update Response in local DB & Supabase
    const respId = `resp_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const responseData = {
      id: respId,
      complaintId: complaint.id,
      analystId,
      responseText: responseText.trim(),
      sentAt: now,
      createdAt: now
    };

    const existingResp = await dbGet('SELECT * FROM responses WHERE complaintId = ?', [complaint.id]);
    if (existingResp) {
      await dbRun('UPDATE responses SET responseText = ?, sentAt = ?, analystId = ? WHERE id = ?', [
        responseText.trim(),
        now,
        analystId,
        existingResp.id
      ]);
    } else {
      await dbRun('INSERT INTO responses (id, complaintId, analystId, responseText, sentAt, createdAt) VALUES (?, ?, ?, ?, ?, ?)', [
        responseData.id,
        responseData.complaintId,
        responseData.analystId,
        responseData.responseText,
        now,
        now
      ]);
      await supabaseQuery.insertResponse(responseData);
    }

    // 2. Mark Complaint status as RESOLVED in local DB & Supabase + append status history
    await dbRun('UPDATE complaints SET status = ?, updatedAt = ? WHERE id = ?', ['RESOLVED', now, complaint.id]);
    await supabaseQuery.updateComplaintStatus(complaint.id, 'RESOLVED');

    // 3. Save Action in complaint_actions & analyst_actions
    const actionId = `act_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const actionData = {
      id: actionId,
      complaintId: complaint.id,
      analystId,
      action: 'RESOLVED_AND_DISPATCHED',
      notes: notes || 'Final response sent to customer via email.',
      createdAt: now
    };
    await dbRun(
      'INSERT INTO complaint_actions (id, complaintId, analystId, action, notes, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
      [actionData.id, actionData.complaintId, actionData.analystId, actionData.action, actionData.notes, now]
    );
    await supabaseQuery.insertAnalystAction(actionData);

    // 4. Send Resolution Email via EmailJS / Email Service
    await sendResolutionEmail({
      email: complaint.email,
      complaintNumber: complaint.complaintNumber,
      responseText: responseText.trim(),
      resolutionDate: now
    });

    return res.json({
      success: true,
      message: 'Complaint resolved and response dispatched to customer email.',
      status: 'RESOLVED'
    });

  } catch (err) {
    console.error('Resolve complaint error:', err);
    return res.status(500).json({ success: false, error: 'Failed to resolve complaint.' });
  }
}
