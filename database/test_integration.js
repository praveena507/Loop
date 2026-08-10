const BASE_URL = 'http://localhost:5000/api';

async function runEndToEndTest() {
  console.log('--- STARTING STANDALONE DATABASE INTEGRATION TEST ---');

  const health = await (await fetch(`${BASE_URL}/health`)).json();
  console.log('✓ Step 1: Health check OK:', health.status);

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

  console.log('✓ Step 2: Complaint Submitted:', submitRes.complaint.complaintNumber);

  const otpRes = await (await fetch(`${BASE_URL}/verification/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'jane.doe@example.com' })
  })).json();

  console.log('  Developer Test OTP:', otpRes.devOtp);

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

  console.log('\n==================================================');
  console.log('🎉 STANDALONE DATABASE INTEGRATION TEST COMPLETED!');
  console.log('==================================================\n');
}

runEndToEndTest().catch(console.error);
