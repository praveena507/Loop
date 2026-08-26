import { dbRun, dbGet, dbAll, supabaseQuery } from '../db/initDb.js';
import { analyzeComplaintWithGemini } from '../services/geminiService.js';
import bcrypt from 'bcryptjs';

const SAMPLE_COMPLAINTS_DATA = [
  {
    name: 'Emily Watson',
    email: 'emily.watson@gmail.com',
    place: 'Downtown Branch #104',
    category: 'Payment',
    reason: 'Duplicate Credit Card Charge on POS Terminal',
    description: 'I was charged twice $148.50 for my transaction on August 24th at 2:45 PM. Cashier swiped my card twice due to reader error. Please refund the duplicate transaction immediately.'
  },
  {
    name: 'David Miller',
    email: 'david.miller@techcorp.io',
    place: 'Online Checkout Portal',
    category: 'Technical Issue',
    reason: 'Payment Gateway Timeout & Account Deducted',
    description: 'During online payment processing, the checkout page threw a 504 Gateway Timeout error. My bank account shows $320 deducted but order status says Unpaid.'
  },
  {
    name: 'Sophia Martinez',
    email: 'sophia.m@designs.com',
    place: 'Metro Station Outlet',
    category: 'Service',
    reason: 'Excessive Wait Time & Unattended Counter',
    description: 'Waited over 45 minutes in line during lunch rush with only one counter open out of four. Staff appeared uncoordinated and unhelpful when asked about queue delays.'
  },
  {
    name: 'James Wilson',
    email: 'j.wilson89@yahoo.com',
    place: 'Westside Fulfillment Hub',
    category: 'Delivery',
    reason: 'Damaged Item Package Delivered',
    description: 'My order #84920 arrived with a crushed outer box and broken internal seals. Product liquid spilled completely inside the package.'
  },
  {
    name: 'Olivia Taylor',
    email: 'olivia.t@gmail.com',
    place: 'Customer Account Portal',
    category: 'Account',
    reason: 'Unable to Reset Password & Locked Out',
    description: 'Password reset link sent to my email expires immediately upon clicking. I have been locked out of my premium account for 3 days.'
  },
  {
    name: 'Robert Chen',
    email: 'robert.chen@consulting.com',
    place: 'Airport Terminal Store',
    category: 'Billing',
    reason: 'Incorrect Sales Tax Applied to Invoice',
    description: 'Charged 18% GST instead of standard 5% tax code on my tax-exempt purchase receipt. Receipt #TRX-9402.'
  },
  {
    name: 'Emma Davis',
    email: 'emma.davis@healthnet.org',
    place: 'North Plaza Branch',
    category: 'Service',
    reason: 'Rude Behavior & Refusal of Valid Return',
    description: 'Store manager refused to process my valid return despite having original purchase receipt within 14-day return policy window.'
  },
  {
    name: 'Michael Brown',
    email: 'm.brown@logistics.net',
    place: 'Express Logistics Hub',
    category: 'Delivery',
    reason: 'Package Marked Delivered But Not Received',
    description: 'Tracking status updated to Delivered at 10:15 AM but package was not delivered to my address or security desk. Doorbell camera shows no delivery truck.'
  },
  {
    name: 'Ava Johnson',
    email: 'ava.johnson@studio.com',
    place: 'Mobile iOS Application',
    category: 'Technical Issue',
    reason: 'App Crashing Constantly During Checkout',
    description: 'iOS App version 3.2.1 force closes immediately upon tapping Pay Now button. Reinstalling app did not resolve the crash.'
  },
  {
    name: 'William Anderson',
    email: 'w.anderson@firm.com',
    place: 'Central Business Hub',
    category: 'Product',
    reason: 'Defective Electronic Component Included',
    description: 'Hardware unit failed to power on out of the box. Power adapter indicator blinks red indicating internal short circuit.'
  },
  {
    name: 'Isabella Garcia',
    email: 'isabella.g@marketing.com',
    place: 'South Bay Outlet',
    category: 'Safety',
    reason: 'Wet Floor Hazard Without Warning Sign',
    description: 'Slipped on freshly mopped floor near aisle 4 because no yellow hazard warning cone was placed by cleaning staff.'
  },
  {
    name: 'Alexander Wright',
    email: 'alex.wright@capital.com',
    place: 'Subscription Management Portal',
    category: 'Billing',
    reason: 'Unauthorized Auto-Renewal Subscription Charge',
    description: 'Card was charged $99 annual subscription fee even though I canceled auto-renewal 10 days before the renewal date.'
  },
  {
    name: 'Mia Thomas',
    email: 'mia.thomas@creatives.co',
    place: 'Eastside Store #202',
    category: 'Product',
    reason: 'Expired Grocery Product Sold',
    description: 'Purchased dairy item yesterday only to find the expiration date was 5 days ago. Store needs to audit shelf stock inventory.'
  },
  {
    name: 'Ethan White',
    email: 'ethan.white@builder.org',
    place: 'Main Distribution Center',
    category: 'Delivery',
    reason: 'Partial Order Shipped Missing Items',
    description: 'Package contained only 2 out of 5 ordered tool kits. Packing slip checked off 5 items erroneously.'
  },
  {
    name: 'Charlotte Harris',
    email: 'c.harris@education.edu',
    place: 'Online Self-Service Portal',
    category: 'Account',
    reason: 'Personal Information Displayed Incorrectly',
    description: 'My profile dashboard displays another customer billing address under my account settings page. Urgent privacy issue.'
  },
  {
    name: 'Daniel Martin',
    email: 'daniel.m@enterprise.com',
    place: 'Tech Support Desk',
    category: 'Service',
    reason: 'Unresolved Support Ticket Closed Without Action',
    description: 'Support ticket #8491 was marked as Resolved automatically without anyone contacting me or fixing the configuration bug.'
  },
  {
    name: 'Amelia Clark',
    email: 'amelia.clark@venture.com',
    place: 'Harbor Branch #305',
    category: 'Payment',
    reason: 'Card Refund Promised But Not Processed',
    description: 'Returned item on August 15th and received store credit slip stating credit card refund within 3 business days. 10 days passed and no refund posted.'
  },
  {
    name: 'Matthew Lewis',
    email: 'm.lewis@tech.io',
    place: 'Web Dashboard',
    category: 'Technical Issue',
    reason: 'Data Export Feature Generates Corrupted CSV',
    description: 'Exporting monthly reports produces a broken 0-byte CSV file with syntax parsing error.'
  },
  {
    name: 'Harper Lee',
    email: 'harper.lee@media.com',
    place: 'City Center Mall Outlet',
    category: 'Facility',
    reason: 'Air Conditioning Broken in Customer Lounge',
    description: 'Extremely hot indoor temperature in waiting lounge with no ventilation or fan. Uncomfortable experience.'
  },
  {
    name: 'Joseph Walker',
    email: 'j.walker@global.org',
    place: 'Logistics Courier Delivery',
    category: 'Delivery',
    reason: 'Driver Threw Parcel Over Gate',
    description: 'Delivery driver tossed fragile glass package over 6ft perimeter fence instead of placing it at the front door.'
  },
  {
    name: 'Evelyn Hall',
    email: 'evelyn.hall@law.com',
    place: 'Corporate Headquarters Outlet',
    category: 'Billing',
    reason: 'Overcharged Item Price Compared to Shelf Tag',
    description: 'Shelf price tag clearly displayed $19.99 but POS scanner charged $29.99. Cashier refused price adjustment.'
  },
  {
    name: 'Jackson Allen',
    email: 'j.allen@ops.net',
    place: 'Android Mobile App',
    category: 'Technical Issue',
    reason: 'OTP SMS Verification Code Delayed by 2 Hours',
    description: 'Verification SMS arrives 2 hours after requesting, making login impossible due to 5-minute OTP expiry limit.'
  },
  {
    name: 'Abigail Young',
    email: 'abigail.y@agency.com',
    place: 'West End Outlet #108',
    category: 'Service',
    reason: 'Unprofessional Staff Miscommunication',
    description: 'Assured by phone that item was held at store counter, but upon arrival store staff had sold item to someone else.'
  },
  {
    name: 'Logan King',
    email: 'logan.king@dev.io',
    place: 'API Developer Portal',
    category: 'Technical Issue',
    reason: 'REST API Authentication Token Expiring Prematurely',
    description: 'OAuth bearer tokens expire within 60 seconds instead of specified 1 hour TTL.'
  },
  {
    name: 'Emily Wright',
    email: 'e.wright@consulting.org',
    place: 'Highland Outlet',
    category: 'Product',
    reason: 'Manufacturing Seal Broken Upon Delivery',
    description: 'Package outer box intact but inner protective security seal was torn open before unboxing.'
  },
  {
    name: 'Benjamin Scott',
    email: 'b.scott@capital.com',
    place: 'Regional Branch #402',
    category: 'Safety',
    reason: 'Blocked Emergency Exit Fire Door',
    description: 'Boxes and pallet inventory stacked directly against emergency exit door in main shopping hall.'
  },
  {
    name: 'Ella Green',
    email: 'ella.green@design.co',
    place: 'Online Payment Gateway',
    category: 'Payment',
    reason: 'UPI Transaction Failed Money Deducted',
    description: 'Payment via UPI failed with error code 99, money debited from bank account but merchant received no credit.'
  },
  {
    name: 'Lucas Adams',
    email: 'lucas.a@logistics.com',
    place: 'Courier Delivery Network',
    category: 'Delivery',
    reason: 'Incorrect Shipping Address Route',
    description: 'Parcel routed to wrong state due to postal barcode misprint by shipping department.'
  },
  {
    name: 'Grace Baker',
    email: 'grace.baker@health.org',
    place: 'Customer Service Helpline',
    category: 'Service',
    reason: 'Call Disconnected After 30 Min Hold Time',
    description: 'Held on customer service phone line for 32 minutes before automated system disconnected the call.'
  },
  {
    name: 'Henry Gonzalez',
    email: 'henry.g@engineering.com',
    place: 'Northside Hub Store',
    category: 'Product',
    reason: 'Missing Warranty Card and User Manual',
    description: 'Box contains main hardware unit but missing warranty card, safety guide, and manual.'
  },
  {
    name: 'Chloe Nelson',
    email: 'chloe.nelson@media.net',
    place: 'Web Portal Login Page',
    category: 'Account',
    reason: 'Two-Factor Authentication Loop Issue',
    description: 'Entering correct 2FA code redirects back to login page without authenticating.'
  },
  {
    name: 'Alexander Carter',
    email: 'a.carter@finance.com',
    place: 'Southside Outlet #501',
    category: 'Billing',
    reason: 'Service Fee Added Without Disclosure',
    description: 'Unexpected $15 processing fee added to final invoice without prior customer disclosure.'
  },
  {
    name: 'Victoria Mitchell',
    email: 'victoria.m@fashion.com',
    place: 'Express Store',
    category: 'Service',
    reason: 'Fitting Room Key Unavailable',
    description: 'Attendant away for over 20 minutes leaving fitting rooms locked and inaccessible.'
  },
  {
    name: 'Sebastian Perez',
    email: 's.perez@systems.io',
    place: 'Mobile App Store',
    category: 'Technical Issue',
    reason: 'Push Notifications Unable to Disable',
    description: 'Notification settings toggle in app does not save preference, continuing to send marketing alerts.'
  },
  {
    name: 'Lily Roberts',
    email: 'lily.roberts@arts.org',
    place: 'Downtown Gallery Store',
    category: 'Product',
    reason: 'Color Discrepancy From Website Photo',
    description: 'Delivered item color is dark brown instead of bright red shown in online product gallery.'
  },
  {
    name: 'Jack Turner',
    email: 'jack.turner@build.net',
    place: 'Central Warehouse Depot',
    category: 'Delivery',
    reason: 'Delayed Freight Express Shipping',
    description: 'Paid $45 extra for guaranteed 24-hour delivery, parcel delivered after 4 business days.'
  },
  {
    name: 'Zoe Phillips',
    email: 'zoe.p@research.com',
    place: 'Account Security Settings',
    category: 'Account',
    reason: 'Unable to Update Primary Email Address',
    description: 'Email change verification link throws 404 Not Found error.'
  },
  {
    name: 'Samuel Campbell',
    email: 'samuel.c@energy.com',
    place: 'Bay Area Branch',
    category: 'Safety',
    reason: 'Exposed Electrical Wiring Near Customer Desk',
    description: 'Uncovered power extension cord lying across pedestrian aisle creating trip and shock risk.'
  },
  {
    name: 'Penelope Parker',
    email: 'penelope.p@events.com',
    place: 'Online Ticket Desk',
    category: 'Payment',
    reason: 'Promotional Discount Code Failed to Apply',
    description: 'Entered valid promo code PROMO20 but full non-discounted price was billed to credit card.'
  },
  {
    name: 'Luke Evans',
    email: 'luke.evans@motors.com',
    place: 'Service Center Outlet',
    category: 'Service',
    reason: 'Vehicle Handover Inspection Incomplete',
    description: 'Service checklist marked interior cleaning completed but seats were uncleaned.'
  },
  {
    name: 'Layla Edwards',
    email: 'layla.e@pharma.org',
    place: 'Pharmacy Express Branch',
    category: 'Product',
    reason: 'Medicine Packaging Defect',
    description: 'Blister pack missing foil seal on 3 medicine tablets.'
  },
  {
    name: 'Gabriel Collins',
    email: 'gabriel.c@security.com',
    place: 'User Profile Portal',
    category: 'Account',
    reason: 'Session Expiring Every 2 Minutes',
    description: 'User dashboard logs out automatically every 120 seconds forcing constant re-login.'
  },
  {
    name: 'Nora Stewart',
    email: 'nora.stewart@travel.com',
    place: 'Airport Pickup Desk',
    category: 'Delivery',
    reason: 'Luggage Express Tag Lost in Transit',
    description: 'Luggage dispatch receipt number not tracked in courier scanner database.'
  },
  {
    name: 'Julian Sanchez',
    email: 'julian.s@networks.io',
    place: 'ISP Customer Portal',
    category: 'Technical Issue',
    reason: 'DNS Resolution Error on Portal Subdomain',
    description: 'Subdomain portal.loop.com fails DNS lookup intermittently from regional ISP networks.'
  },
  {
    name: 'Hazel Morris',
    email: 'hazel.m@apparel.com',
    place: 'Flagship Store #001',
    category: 'Facility',
    reason: 'Elevator Out of Order No Ramp Access',
    description: 'Main elevator disabled for maintenance without wheelchair ramp alternative.'
  },
  {
    name: 'Wyatt Rogers',
    email: 'wyatt.r@consulting.net',
    place: 'Online Order Portal',
    category: 'Billing',
    reason: 'Invoice PDF Missing Company Tax ID',
    description: 'Generated PDF invoice missing mandatory VAT registration number required for accounting.'
  },
  {
    name: 'Aurora Reed',
    email: 'aurora.reed@labs.com',
    place: 'West Plaza Branch',
    category: 'Service',
    reason: 'Long Queue at Billing Counter During Opening Hours',
    description: 'Store opened 20 minutes late leaving 30 customers waiting outside in heat.'
  },
  {
    name: 'Lincoln Cook',
    email: 'lincoln.c@finance.org',
    place: 'Credit Support Desk',
    category: 'Payment',
    reason: 'Refund Cheque Bounced Due to Signature Mismatch',
    description: 'Refund cheque issued by finance office rejected by bank due to missing authorized signature.'
  },
  {
    name: 'Samantha Morgan',
    email: 'samantha.m@media.com',
    place: 'Digital Downloads Portal',
    category: 'Product',
    reason: 'Purchased E-Book Download Link Broken',
    description: 'Clicking download link yields 403 Forbidden file permission error.'
  },
  {
    name: 'Mateo Bell',
    email: 'mateo.bell@software.io',
    place: 'Cloud Console',
    category: 'Technical Issue',
    reason: 'Cloud Server Instance Provisioning Failure',
    description: 'API call to spin up cloud instance times out after 10 minutes leaving instance in Error state.'
  }
];

export async function seed50Complaints() {
  console.log('🌱 Seeding 50 Corporate Complaints into LOOP DB & Supabase...');

  // 1. Ensure Staff Users exist
  const passwordHash = await bcrypt.hash('Analyst@12345', 10);
  const adminHash = await bcrypt.hash('Admin@12345', 10);
  const now = new Date().toISOString();

  const staffUsers = [
    { id: 'usr_admin_01', name: 'Admin Supervisor', email: 'admin@loop.com', role: 'ADMIN', pass: adminHash },
    { id: 'usr_analyst_01', name: 'Analyst Alex Rivera', email: 'analyst@loop.com', role: 'ANALYST', pass: passwordHash },
    { id: 'usr_analyst_02', name: 'Analyst Sarah Jenkins', email: 'sarah.analyst@loop.com', role: 'ANALYST', pass: passwordHash },
    { id: 'usr_analyst_03', name: 'Analyst Marcus Chen', email: 'marcus.analyst@loop.com', role: 'ANALYST', pass: passwordHash },
    { id: 'usr_analyst_04', name: 'Analyst Priya Sharma', email: 'priya.analyst@loop.com', role: 'ANALYST', pass: passwordHash }
  ];

  for (const u of staffUsers) {
    const existing = await dbGet('SELECT * FROM staff_users WHERE id = ? OR email = ?', [u.id, u.email]);
    if (!existing) {
      await dbRun(
        `INSERT INTO staff_users (id, name, email, passwordHash, role, status, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, 'ACTIVE', ?, ?)`,
        [u.id, u.name, u.email, u.pass, u.role, now, now]
      );
    }
  }

  const analystsList = ['usr_analyst_01', 'usr_analyst_02', 'usr_analyst_03', 'usr_analyst_04'];

  let count = 0;
  for (let i = 0; i < SAMPLE_COMPLAINTS_DATA.length; i++) {
    const sample = SAMPLE_COMPLAINTS_DATA[i];
    const index = i + 1;
    const complaintId = `cmp_seed_${String(index).padStart(3, '0')}`;
    const complaintNumber = `LOOP-2026-${String(849000 + index)}`;
    const trimmedEmail = sample.email.toLowerCase();

    // Check if complaint already exists
    const existingCmp = await dbGet('SELECT * FROM complaints WHERE id = ? OR complaintNumber = ?', [complaintId, complaintNumber]);
    if (existingCmp) {
      continue;
    }

    // Customer record
    let customer = await dbGet('SELECT * FROM customers WHERE LOWER(email) = ?', [trimmedEmail]);
    if (!customer) {
      const custId = `cust_seed_${index}`;
      await dbRun(
        `INSERT INTO customers (id, name, email, emailVerified, createdAt, updatedAt) VALUES (?, ?, ?, 1, ?, ?)`,
        [custId, sample.name, trimmedEmail, now, now]
      );
      customer = { id: custId, name: sample.name, email: trimmedEmail };
    }

    // Determine operational lifecycle status & assignment
    // Items 1-15: SUBMITTED / AI_ANALYZED (Unassigned in Admin Queue)
    // Items 16-35: IN_PROGRESS (Assigned across analysts)
    // Items 36-50: RESOLVED (Assigned across analysts with final customer response)
    let status = 'SUBMITTED';
    let assignedAnalystId = null;

    if (index > 15 && index <= 35) {
      status = 'IN_PROGRESS';
      assignedAnalystId = analystsList[i % analystsList.length];
    } else if (index > 35) {
      status = 'RESOLVED';
      assignedAnalystId = analystsList[i % analystsList.length];
    }

    const complaintData = {
      id: complaintId,
      complaintNumber,
      customerId: customer.id,
      name: sample.name,
      email: trimmedEmail,
      place: sample.place,
      category: sample.category,
      reason: sample.reason,
      description: sample.description,
      attachmentUrl: (index % 3 === 0) ? `https://loop.com/proofs/receipt_${index}.pdf` : '',
      status,
      createdAt: new Date(Date.now() - (50 - index) * 3600000 * 4).toISOString(),
      updatedAt: now
    };

    // 1. Insert Complaint
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
        complaintData.createdAt,
        complaintData.updatedAt
      ]
    );
    await supabaseQuery.insertComplaint(complaintData);

    // 2. Perform AI Triage Analysis
    const aiRes = await analyzeComplaintWithGemini({
      reason: sample.reason,
      description: sample.description,
      category: sample.category,
      place: sample.place,
      attachmentUrl: complaintData.attachmentUrl
    });

    const aiData = {
      id: `ai_${complaintId}`,
      complaintId,
      sentiment: aiRes.sentiment,
      sentimentScore: aiRes.sentimentScore,
      category: aiRes.category,
      theme: aiRes.theme,
      priority: aiRes.priority,
      priorityScore: aiRes.priorityScore,
      summary: aiRes.summary,
      keywords: JSON.stringify(aiRes.keywords || [sample.category]),
      suggestedResponse: aiRes.suggestedResponse,
      attachmentAnalyzed: aiRes.attachmentAnalyzed,
      attachmentSummary: aiRes.attachmentSummary,
      proofMatch: aiRes.proofMatch,
      rootCause: aiRes.rootCause,
      sectionName: aiRes.sectionName,
      confidence: aiRes.confidence || 'High',
      severity: aiRes.severity || 'Significant',
      urgency: aiRes.urgency || 'Standard',
      impact: aiRes.impact || 'Moderate Inconvenience',
      affectedScope: aiRes.affectedScope || 'Single User',
      priorityReason: aiRes.priorityReason || 'Based on complaint analysis.',
      keyFactors: JSON.stringify(aiRes.keyFactors || ['Fact verified']),
      createdAt: complaintData.createdAt,
      updatedAt: now
    };

    await dbRun(
      `INSERT INTO ai_analysis 
       (id, complaintId, sentiment, sentimentScore, category, theme, priority, priorityScore, summary, keywords, suggestedResponse, attachmentAnalyzed, attachmentSummary, proofMatch, rootCause, sectionName, confidence, severity, urgency, impact, affectedScope, priorityReason, keyFactors, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        aiData.id,
        aiData.complaintId,
        aiData.sentiment,
        aiData.sentimentScore,
        aiData.category,
        aiData.theme,
        aiData.priority,
        aiData.priorityScore,
        aiData.summary,
        aiData.keywords,
        aiData.suggestedResponse,
        aiData.attachmentAnalyzed,
        aiData.attachmentSummary,
        aiData.proofMatch,
        aiData.rootCause,
        aiData.sectionName,
        aiData.confidence,
        aiData.severity,
        aiData.urgency,
        aiData.impact,
        aiData.affectedScope,
        aiData.priorityReason,
        aiData.keyFactors,
        aiData.createdAt,
        aiData.updatedAt
      ]
    );
    await supabaseQuery.insertAiAnalysis(aiData);

    // 3. Status History Steps
    await dbRun(
      'INSERT INTO complaint_status_history (id, complaintId, status, createdAt) VALUES (?, ?, ?, ?)',
      [`sh_${complaintId}_1`, complaintId, 'SUBMITTED', complaintData.createdAt]
    );
    await dbRun(
      'INSERT INTO complaint_status_history (id, complaintId, status, createdAt) VALUES (?, ?, ?, ?)',
      [`sh_${complaintId}_2`, complaintId, 'AI_ANALYZED', complaintData.createdAt]
    );

    // 4. If Assigned, Record Assignment Action & Status History
    if (assignedAnalystId) {
      const actId = `act_${complaintId}_assign`;
      await dbRun(
        'INSERT INTO complaint_actions (id, complaintId, analystId, action, notes, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
        [actId, complaintId, assignedAnalystId, 'ASSIGNED_BY_ADMIN', 'Assigned by Admin based on workload optimization.', complaintData.createdAt]
      );
      await dbRun(
        'INSERT INTO complaint_status_history (id, complaintId, status, createdAt) VALUES (?, ?, ?, ?)',
        [`sh_${complaintId}_3`, complaintId, 'IN_PROGRESS', complaintData.createdAt]
      );
    }

    // 5. If Resolved, Record Resolution Action & Response Text
    if (status === 'RESOLVED') {
      const respId = `resp_${complaintId}`;
      const responseText = `Dear ${sample.name},\n\nThank you for bringing this ${sample.category.toLowerCase()} issue regarding "${sample.reason}" to LOOP Support.\n\nOur team has investigated your case and verified the details provided for ${sample.place}. A resolution has been completed.\n\nBest regards,\nLOOP Support Team`;
      
      await dbRun(
        'INSERT INTO responses (id, complaintId, analystId, responseText, sentAt, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
        [respId, complaintId, assignedAnalystId, responseText, now, now]
      );
      await dbRun(
        'INSERT INTO complaint_actions (id, complaintId, analystId, action, notes, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
        [`act_${complaintId}_resolve`, complaintId, assignedAnalystId, 'RESOLVED_AND_DISPATCHED', 'Official resolution response dispatched to customer email.', now]
      );
      await dbRun(
        'INSERT INTO complaint_status_history (id, complaintId, status, createdAt) VALUES (?, ?, ?, ?)',
        [`sh_${complaintId}_4`, complaintId, 'RESOLVED', now]
      );
    }

    count++;
  }

  console.log(`✅ Successfully seeded ${count} corporate complaints with full AI triage and lifecycle storage!`);
  process.exit(0);
}

seed50Complaints().catch((err) => {
  console.error('Seeding error:', err);
  process.exit(1);
});
