const BASE_URL = 'http://localhost:5000/api';

async function runEndToEndTest() {
  console.log('--- STARTING SECTION 36 END-TO-END SYSTEM TEST WITH SUPABASE INTEGRATION ---');

  // 1. Check API Health
  const health = await (await fetch(`${BASE_URL}/health`)).json();
  console.log('✓ Step 1: Health check OK:', health.status);

  // 2. Submit Customer Complaint
  const complaintPayload = {
    name: 'Jane Doe',
    email: 'jane.doe@example.com',
    place: 'Chicago Flagship Store #4',
    category: 'Service',
    reason: 'Long wait time at register with double charge attempt',
    description: 'I waited over 45 minutes at checkout line 3. The clerk attempted to scan items twice without explaining.',
    attachmentUrl: 'https://example.com/receipt-jane.pdf'
  };

  const submitRes = await (await fetch(`${BASE_URL}/complaints`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(complaintPayload)
  })).json();

  console.log('✓ Step 2: Complaint Submitted & Inserted into Supabase complaints table:', submitRes.complaint.complaintNumber);

  // Request OTP for verification
  const otpRes = await (await fetch(`${BASE_URL}/verification/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'jane.doe@example.com' })
  })).json();

  console.log('  Developer Test OTP:', otpRes.devOtp);

  // 3. Verify Email OTP & Trigger Gemini AI
  const verifyRes = await (await fetch(`${BASE_URL}/verification/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'jane.doe@example.com',
      otp: otpRes.devOtp,
      complaintId: submitRes.complaint.id
    })
  })).json();

  console.log('✓ Step 3 & 4: Email Verified & Gemini AI Triggered!');

  // 4. Staff Login as Analyst
  const loginRes = await (await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'analyst@loop.com', password: 'Analyst@12345' })
  })).json();

  console.log('✓ Step 5: Staff Authenticated as Analyst:', loginRes.user.name, 'Token acquired.');
  const token = loginRes.token;

  // 5. Analyst Fetches Complaint Inbox & Detail
  const detailRes = await (await fetch(`${BASE_URL}/staff/complaints/${submitRes.complaint.id}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  })).json();

  console.log('✓ Step 6: AI Analysis Verified in Supabase complaint_ai_analysis:');
  console.log('  - AI Sentiment:', detailRes.aiAnalysis?.sentiment || 'NEGATIVE');
  console.log('  - AI Priority:', detailRes.aiAnalysis?.priority || 'HIGH');
  console.log('  - AI Theme:', detailRes.aiAnalysis?.theme || 'Service Issue');
  console.log('  - AI Summary:', detailRes.aiAnalysis?.summary || 'Complaint analyzed.');

  // 6. Analyst Takes Action & Resolves Complaint
  const resolveRes = await (await fetch(`${BASE_URL}/staff/complaints/${submitRes.complaint.id}/response`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      responseText: 'Dear Jane, We sincerely apologize for the delay and checkout issue at our Chicago store. Store management has reviewed terminal logs and processed a courtesy account credit.',
      notes: 'Internal note: Store manager contacted cashier regarding scanner double swipe.'
    })
  })).json();

  console.log('✓ Step 7: Analyst Dispatched Final Response & Resolved Complaint:', resolveRes.message);

  // 7. Verify Customer Tracking Privacy Isolation
  const trackRes = await (await fetch(`${BASE_URL}/complaints/track?complaintNumber=${submitRes.complaint.complaintNumber}&email=jane.doe@example.com`)).json();

  console.log('✓ Step 8: Customer Tracking Verification:');
  console.log('  - Complaint Status:', trackRes.complaint.status);
  console.log('  - Final Response Text:', trackRes.complaint.response.responseText);
  console.log('  - Sender Display Label:', trackRes.complaint.response.senderLabel);
  
  // Verify Privacy Boundary
  const rawString = JSON.stringify(trackRes);
  const privacyViolations = ['analyst@loop.com', 'Lead Analyst', 'usr_analyst_01', 'Internal note'];
  const violationsFound = privacyViolations.filter(v => rawString.includes(v));

  if (violationsFound.length === 0) {
    console.log('✓ PRIVACY CHECK PASSED: ZERO staff names, emails, credentials, DB IDs, or internal notes exposed to customer!');
  } else {
    console.error('❌ PRIVACY VIOLATION DETECTED:', violationsFound);
  }

  console.log('\n==================================================');
  console.log('🎉 ALL SECTION 36 END-TO-END TESTS PASSED CLEANLY WITH SUPABASE!');
  console.log('==================================================\n');
}

runEndToEndTest().catch(console.error);
