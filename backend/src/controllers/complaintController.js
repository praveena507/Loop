import { dbRun, dbGet, dbAll, supabaseQuery } from '../db/initDb.js';
import { sendResolutionEmail, createEmailVerification } from '../services/emailService.js';
import { generateExplicitSolutionWithGemini } from '../services/geminiService.js';

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

    // Create verification OTP record
    const verification = await createEmailVerification(trimmedEmail, name);

    return res.status(201).json({
      success: true,
      message: 'Complaint created successfully. Email verification required.',
      otp: verification.otp,
      expiresAt: verification.expiresAt,
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
    const { status, category, priority, search, assignedToMe, unassignedOnly } = req.query;
    const user = req.user;

    let sql = `
      SELECT c.*, 
             a.sentiment, a.sentimentScore, a.category as aiCategory, a.theme, 
             a.priority, a.priorityScore, a.confidence, a.severity, a.urgency, a.impact, a.affectedScope, a.priorityReason, a.keyFactors,
             a.summary as aiSummary, a.attachmentSummary, a.proofMatch, a.rootCause, a.sectionName,
             (
               SELECT ca.analystId FROM complaint_actions ca 
               WHERE ca.complaintId = c.id AND ca.analystId IS NOT NULL 
               ORDER BY ca.createdAt DESC LIMIT 1
             ) as assignedAnalystId,
             (
               SELECT su.name FROM complaint_actions ca 
               JOIN staff_users su ON ca.analystId = su.id 
               WHERE ca.complaintId = c.id AND ca.analystId IS NOT NULL 
               ORDER BY ca.createdAt DESC LIMIT 1
             ) as assignedAnalystName
      FROM complaints c
      LEFT JOIN ai_analysis a ON c.id = a.complaintId
      WHERE 1=1
    `;
    const params = [];

    // STRICT ROLE-BASED ACCESS CONTROL:
    // Analysts can strictly ONLY see complaints assigned to their analyst account (matched by ID or Email)
    if (user && user.role === 'ANALYST') {
      sql += ` AND c.id IN (
        SELECT ca1.complaintId FROM complaint_actions ca1
        JOIN staff_users su ON (ca1.analystId = su.id OR ca1.analystId = su.email)
        WHERE (su.id = ? OR LOWER(su.email) = LOWER(?))
      )`;
      params.push(user.id, user.email);
    } else if (user && user.role === 'ADMIN') {
      if (assignedToMe === 'true') {
        sql += ` AND c.id IN (
          SELECT ca1.complaintId FROM complaint_actions ca1
          WHERE (ca1.analystId = ? OR ca1.analystId IN (SELECT id FROM staff_users WHERE LOWER(email) = LOWER(?)))
        )`;
        params.push(user.id, user.email);
      } else if (unassignedOnly === 'true') {
        sql += ` AND c.id NOT IN (
          SELECT complaintId FROM complaint_actions WHERE analystId IS NOT NULL
        )`;
      }
    }

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
    const user = req.user;

    const complaint = await dbGet('SELECT * FROM complaints WHERE id = ? OR complaintNumber = ?', [id, id]);
    if (!complaint) {
      return res.status(404).json({ success: false, error: 'Complaint not found.' });
    }

    // STRICT BACKEND AUTHORIZATION:
    // Check latest assigned analyst
    const assignedRow = await dbGet(
      `SELECT ca.analystId, su.name as analystName
       FROM complaint_actions ca
       LEFT JOIN staff_users su ON ca.analystId = su.id
       WHERE ca.complaintId = ? AND ca.analystId IS NOT NULL
       ORDER BY ca.createdAt DESC LIMIT 1`,
      [complaint.id]
    );

    if (user && user.role === 'ANALYST') {
      if (!assignedRow || assignedRow.analystId !== user.id) {
        return res.status(403).json({
          success: false,
          error: 'Forbidden: Access denied. This complaint is not assigned to your analyst account.'
        });
      }
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

    // Department requests & reports
    const departmentRequests = await dbAll(
      `SELECT dr.*, su.name as requestedByName, rep.id as reportId, rep.investigationResult, rep.evidence, rep.finding, rep.actionTaken, rep.recommendation, rep.supportingDocs, rep.submittedAt
       FROM department_requests dr
       LEFT JOIN staff_users su ON dr.requestedBy = su.id
       LEFT JOIN department_reports rep ON dr.id = rep.requestId
       WHERE dr.complaintId = ?
       ORDER BY dr.createdAt DESC`,
      [complaint.id]
    );

    const feedback = await dbGet('SELECT * FROM complaint_feedback WHERE complaintId = ?', [complaint.id]);

    const statusHistory = await dbAll(
      'SELECT status, createdAt FROM complaint_status_history WHERE complaintId = ? ORDER BY createdAt ASC',
      [complaint.id]
    );

    return res.json({
      success: true,
      complaint: {
        ...complaint,
        assignedAnalystId: assignedRow ? assignedRow.analystId : null,
        assignedAnalystName: assignedRow ? assignedRow.analystName : null
      },
      aiAnalysis,
      actions,
      response,
      departmentRequests,
      departmentReport: departmentRequests.length > 0 ? departmentRequests[0] : null,
      feedback,
      statusHistory: statusHistory.length > 0 ? statusHistory : [{ status: complaint.status, createdAt: complaint.createdAt }]
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

// Analyst: Send formal proof/information request to concerned department
export async function createDepartmentRequest(req, res) {
  try {
    const { id } = req.params;
    const { departmentName, departmentId, requiredInformation, reason, priority, deadline } = req.body;
    const analystId = req.user ? req.user.id : 'ANALYST';

    if (!departmentName || !requiredInformation || !reason) {
      return res.status(400).json({ success: false, error: 'Department name, required information, and reason are required.' });
    }

    const complaint = await dbGet('SELECT * FROM complaints WHERE id = ? OR complaintNumber = ?', [id, id]);
    if (!complaint) {
      return res.status(404).json({ success: false, error: 'Complaint not found.' });
    }

    const now = new Date().toISOString();
    const reqId = `dreq_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

    const requestData = {
      id: reqId,
      complaintId: complaint.id,
      departmentId: departmentId || null,
      departmentName: departmentName.trim(),
      requestedBy: analystId,
      priority: priority || 'P2',
      requiredInformation: requiredInformation.trim(),
      reason: reason.trim(),
      deadline: deadline || null,
      status: 'PENDING',
      createdAt: now,
      updatedAt: now
    };

    await dbRun(
      `INSERT INTO department_requests (id, complaintId, departmentId, departmentName, requestedBy, priority, requiredInformation, reason, deadline, status, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        requestData.id,
        requestData.complaintId,
        requestData.departmentId,
        requestData.departmentName,
        requestData.requestedBy,
        requestData.priority,
        requestData.requiredInformation,
        requestData.reason,
        requestData.deadline,
        requestData.status,
        now,
        now
      ]
    );

    // Sync to Supabase
    await supabaseQuery.insertDepartmentRequest(requestData);

    // Update complaint status to WAITING_FOR_DEPARTMENT
    await dbRun('UPDATE complaints SET status = ?, updatedAt = ? WHERE id = ?', ['WAITING_FOR_DEPARTMENT', now, complaint.id]);
    await supabaseQuery.updateComplaintStatus(complaint.id, 'WAITING_FOR_DEPARTMENT');

    // Record action log
    const actionId = `act_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    await dbRun(
      'INSERT INTO complaint_actions (id, complaintId, analystId, action, notes, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
      [actionId, complaint.id, analystId, 'SENT_TO_DEPARTMENT', `Routed case to ${departmentName} department for proof/investigation. Priority: ${priority || 'P2'}.`, now]
    );

    return res.status(201).json({
      success: true,
      message: `Request successfully routed to ${departmentName} department. Complaint status set to WAITING_FOR_DEPARTMENT.`,
      request: requestData
    });

  } catch (err) {
    console.error('Create department request error:', err);
    return res.status(500).json({ success: false, error: 'Failed to create department request.' });
  }
}

// Department: Submit investigation report
export async function submitDepartmentReport(req, res) {
  try {
    const { requestId } = req.params;
    const { investigationResult, evidence, finding, actionTaken, recommendation, supportingDocs } = req.body;

    if (!investigationResult || !finding || !actionTaken || !recommendation) {
      return res.status(400).json({ success: false, error: 'Investigation result, finding, action taken, and recommendation are required.' });
    }

    const deptReq = await dbGet('SELECT * FROM department_requests WHERE id = ?', [requestId]);
    if (!deptReq) {
      return res.status(404).json({ success: false, error: 'Department request not found.' });
    }

    const now = new Date().toISOString();
    const repId = `drep_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

    const reportData = {
      id: repId,
      requestId: deptReq.id,
      complaintId: deptReq.complaintId,
      departmentName: deptReq.departmentName,
      investigationResult: investigationResult.trim(),
      evidence: evidence ? evidence.trim() : 'Verified internal records.',
      finding: finding.trim(),
      actionTaken: actionTaken.trim(),
      recommendation: recommendation.trim(),
      supportingDocs: supportingDocs ? supportingDocs.trim() : '',
      submittedAt: now,
      createdAt: now
    };

    await dbRun(
      `INSERT INTO department_reports (id, requestId, complaintId, departmentName, investigationResult, evidence, finding, actionTaken, recommendation, supportingDocs, submittedAt, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        reportData.id,
        reportData.requestId,
        reportData.complaintId,
        reportData.departmentName,
        reportData.investigationResult,
        reportData.evidence,
        reportData.finding,
        reportData.actionTaken,
        reportData.recommendation,
        reportData.supportingDocs,
        now,
        now
      ]
    );

    // Update request status to REPORT_SUBMITTED
    await dbRun('UPDATE department_requests SET status = ?, updatedAt = ? WHERE id = ?', ['REPORT_SUBMITTED', now, deptReq.id]);
    await supabaseQuery.updateDepartmentRequestStatus(deptReq.id, 'REPORT_SUBMITTED');

    // Update complaint status to READY_FOR_ANALYST_REVIEW
    await dbRun('UPDATE complaints SET status = ?, updatedAt = ? WHERE id = ?', ['READY_FOR_ANALYST_REVIEW', now, deptReq.complaintId]);
    await supabaseQuery.updateComplaintStatus(deptReq.complaintId, 'READY_FOR_ANALYST_REVIEW');

    // Create action log
    const actionId = `act_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    await dbRun(
      'INSERT INTO complaint_actions (id, complaintId, analystId, action, notes, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
      [actionId, deptReq.complaintId, null, 'DEPARTMENT_REPORT_SUBMITTED', `Investigation report submitted by ${deptReq.departmentName} department.`, now]
    );

    return res.status(201).json({
      success: true,
      message: 'Department investigation report submitted successfully. Case moved to READY_FOR_ANALYST_REVIEW.',
      report: reportData
    });

  } catch (err) {
    console.error('Submit department report error:', err);
    return res.status(500).json({ success: false, error: 'Failed to submit department report.' });
  }
}

// Analyst: Review & decide on Department Report (ACCEPT_FINDINGS or REQUEST_MORE_INFO)
export async function reviewDepartmentReport(req, res) {
  try {
    const { id } = req.params;
    const { decision, additionalInformationRequired, notes } = req.body;
    const analystId = req.user ? req.user.id : null;

    const complaint = await dbGet('SELECT * FROM complaints WHERE id = ? OR complaintNumber = ?', [id, id]);
    if (!complaint) {
      return res.status(404).json({ success: false, error: 'Complaint not found.' });
    }

    const deptReq = await dbGet('SELECT * FROM department_requests WHERE complaintId = ? ORDER BY createdAt DESC LIMIT 1', [complaint.id]);
    if (!deptReq) {
      return res.status(400).json({ success: false, error: 'No department request exists for this complaint.' });
    }

    const now = new Date().toISOString();

    if (decision === 'ACCEPT') {
      await dbRun('UPDATE department_requests SET status = ?, updatedAt = ? WHERE id = ?', ['COMPLETED', now, deptReq.id]);
      await dbRun('UPDATE complaints SET status = ?, updatedAt = ? WHERE id = ?', ['READY_FOR_USER_RESPONSE', now, complaint.id]);
      await supabaseQuery.updateComplaintStatus(complaint.id, 'READY_FOR_USER_RESPONSE');

      const actionId = `act_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      await dbRun(
        'INSERT INTO complaint_actions (id, complaintId, analystId, action, notes, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
        [actionId, complaint.id, analystId, 'ANALYST_ACCEPTED_DEPARTMENT_REPORT', notes || 'Analyst accepted department investigation findings and confirmed resolution readiness.', now]
      );

      return res.json({
        success: true,
        message: 'Department report accepted. Case is ready for final response to user.',
        status: 'READY_FOR_USER_RESPONSE'
      });

    } else if (decision === 'REQUEST_MORE_INFO') {
      if (!additionalInformationRequired) {
        return res.status(400).json({ success: false, error: 'Details on additional information required are mandatory.' });
      }

      await dbRun('UPDATE department_requests SET status = ?, requiredInformation = ?, updatedAt = ? WHERE id = ?', [
        'MORE_INFO_REQUESTED',
        `${deptReq.requiredInformation}\n\n[ADDITIONAL REQUEST]: ${additionalInformationRequired.trim()}`,
        now,
        deptReq.id
      ]);

      await dbRun('UPDATE complaints SET status = ?, updatedAt = ? WHERE id = ?', ['WAITING_FOR_DEPARTMENT', now, complaint.id]);
      await supabaseQuery.updateComplaintStatus(complaint.id, 'WAITING_FOR_DEPARTMENT');

      const actionId = `act_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      await dbRun(
        'INSERT INTO complaint_actions (id, complaintId, analystId, action, notes, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
        [actionId, complaint.id, analystId, 'REQUESTED_MORE_DEPARTMENT_INFO', `Additional info requested: ${additionalInformationRequired.trim()}`, now]
      );

      return res.json({
        success: true,
        message: 'Additional information request dispatched to department. Case status reverted to WAITING_FOR_DEPARTMENT.',
        status: 'WAITING_FOR_DEPARTMENT'
      });
    } else {
      return res.status(400).json({ success: false, error: 'Invalid decision type. Expected ACCEPT or REQUEST_MORE_INFO.' });
    }

  } catch (err) {
    console.error('Review department report error:', err);
    return res.status(500).json({ success: false, error: 'Failed to review department report.' });
  }
}

export async function resolveComplaintAndRespond(req, res) {
  try {
    const { id } = req.params;
    const { responseText, notes, confirmNoDeptRequired } = req.body;
    const analystId = req.user ? req.user.id : null;

    if (!responseText || !responseText.trim()) {
      return res.status(400).json({ success: false, error: 'Response text is required.' });
    }

    const complaint = await dbGet('SELECT * FROM complaints WHERE id = ? OR complaintNumber = ?', [id, id]);
    if (!complaint) {
      return res.status(404).json({ success: false, error: 'Complaint not found.' });
    }

    // MANDATORY INVESTIGATION GATEKEEPER CHECK:
    // Check if there is an active department request that has NOT been completed
    const pendingDeptReq = await dbGet(
      'SELECT * FROM department_requests WHERE complaintId = ? AND status != ? ORDER BY createdAt DESC LIMIT 1',
      [complaint.id, 'COMPLETED']
    );

    if (pendingDeptReq && !confirmNoDeptRequired) {
      return res.status(400).json({
        success: false,
        error: `Cannot resolve complaint: Department investigation for '${pendingDeptReq.departmentName}' is currently '${pendingDeptReq.status}'. The Analyst must receive, review, and accept the formal department report before completing resolution.`
      });
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

    // If there was a pending request, mark it completed now
    if (pendingDeptReq) {
      await dbRun('UPDATE department_requests SET status = ?, updatedAt = ? WHERE id = ?', ['COMPLETED', now, pendingDeptReq.id]);
    }

    // 3. Save Action in complaint_actions & analyst_actions
    const actionId = `act_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const actionData = {
      id: actionId,
      complaintId: complaint.id,
      analystId,
      action: 'RESOLVED_AND_DISPATCHED',
      notes: notes || 'Final response confirmed and dispatched to customer email.',
      createdAt: now
    };
    await dbRun(
      'INSERT INTO complaint_actions (id, complaintId, analystId, action, notes, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
      [actionId, complaint.id, analystId, actionData.action, actionData.notes, now]
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

export async function generateExplicitSolutionController(req, res) {
  try {
    const { id } = req.params;
    const { tone, customNotes } = req.body;

    const complaint = await dbGet('SELECT * FROM complaints WHERE id = ? OR complaintNumber = ?', [id, id]);
    if (!complaint) {
      return res.status(404).json({ success: false, error: 'Complaint not found.' });
    }

    const aiAnalysis = await dbGet('SELECT * FROM ai_analysis WHERE complaintId = ?', [complaint.id]);

    const activeReq = await dbGet(
      'SELECT * FROM department_requests WHERE complaintId = ? ORDER BY createdAt DESC LIMIT 1',
      [complaint.id]
    );

    let deptReport = null;
    if (activeReq) {
      deptReport = await dbGet(
        'SELECT * FROM department_reports WHERE requestId = ? ORDER BY createdAt DESC LIMIT 1',
        [activeReq.id]
      );
    }

    const explicitSolution = await generateExplicitSolutionWithGemini({
      complainantName: complaint.name,
      reason: complaint.reason,
      description: complaint.description,
      category: complaint.category,
      place: complaint.place,
      departmentName: activeReq?.departmentName || aiAnalysis?.recommendedDepartment,
      investigationFindings: deptReport?.investigationFindings || aiAnalysis?.summary,
      actionTaken: deptReport?.actionTaken,
      rootCause: deptReport?.rootCause || aiAnalysis?.rootCause,
      evidenceProvided: deptReport?.evidenceProvided || aiAnalysis?.proofMatch,
      tone: tone || 'FORMAL_RESOLVED',
      customNotes: customNotes || ''
    });

    return res.json({
      success: true,
      solution: explicitSolution
    });

  } catch (err) {
    console.error('Generate explicit solution error:', err);
    return res.status(500).json({ success: false, error: 'Failed to generate explicit AI solution.' });
  }
}

