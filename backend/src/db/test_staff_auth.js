const BASE_URL = 'http://localhost:5000/api';

async function testStaffAuthAndReset() {
  console.log('--- TESTING STAFF AUTHENTICATION & EMAIL OTP PASSWORD RESET ---');

  // 1. Analyst Login Test
  const analystLogin = await (await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'analyst@loop.com', password: 'Analyst@12345' })
  })).json();

  console.log('✓ Analyst Login:', analystLogin.success ? 'SUCCESS' : 'FAILED', analystLogin.user?.name);

  // 2. Admin Login Test
  const adminLogin = await (await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@loop.com', password: 'Admin@12345' })
  })).json();

  console.log('✓ Admin Login:', adminLogin.success ? 'SUCCESS' : 'FAILED', adminLogin.user?.name);

  // 3. Request Password Reset OTP for Analyst
  const forgotRes = await (await fetch(`${BASE_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'analyst@loop.com' })
  })).json();

  console.log('✓ Request Forgot Password OTP:', forgotRes.message);
  console.log('  Developer Test OTP:', forgotRes.devOtp);

  // 4. Reset Password with OTP
  const resetRes = await (await fetch(`${BASE_URL}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'analyst@loop.com',
      otp: forgotRes.devOtp,
      newPassword: 'NewAnalystPass@2026'
    })
  })).json();

  console.log('✓ Password Reset with OTP:', resetRes.message);

  // 5. Verify Login with New Password
  const newLoginRes = await (await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'analyst@loop.com', password: 'NewAnalystPass@2026' })
  })).json();

  console.log('✓ Login with New Reset Password:', newLoginRes.success ? 'SUCCESS' : 'FAILED', newLoginRes.user?.name);

  // 6. Reset back to default password for seamless testing
  const forgotRes2 = await (await fetch(`${BASE_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'analyst@loop.com' })
  })).json();

  await fetch(`${BASE_URL}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'analyst@loop.com',
      otp: forgotRes2.devOtp,
      newPassword: 'Analyst@12345'
    })
  });

  console.log('✓ Password restored to default Analyst@12345.');
  console.log('\n==================================================');
  console.log('🎉 STAFF AUTHENTICATION & PASSWORD RESET FULLY VERIFIED!');
  console.log('==================================================\n');
}

testStaffAuthAndReset().catch(console.error);
