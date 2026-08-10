import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { dbGet, dbRun } from '../db/initDb.js';
import { createEmailVerification, verifyEmailOTP } from '../services/emailService.js';

const JWT_SECRET = process.env.JWT_SECRET || 'loop_super_secret_jwt_key_2026_spec';

/**
 * Staff Login (Admin & Analyst)
 */
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await dbGet('SELECT * FROM staff_users WHERE LOWER(email) = ?', [cleanEmail]);

    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid staff email or password.' });
    }

    if (user.status !== 'ACTIVE') {
      return res.status(403).json({ success: false, error: 'Staff account is deactivated. Contact System Administrator.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid staff email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Audit log entry
    await dbRun(
      `INSERT INTO audit_logs (id, userId, action, entity, entityId, ipAddress, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [`audit_${Date.now()}`, user.id, 'STAFF_LOGIN', 'staff_users', user.id, req.ip || '127.0.0.1', new Date().toISOString()]
    );

    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, error: 'Server error during staff authentication.' });
  }
}

/**
 * Request Password Reset OTP for Staff (Admin or Analyst)
 */
export async function requestPasswordResetOTP(req, res) {
  try {
    const { email } = req.body;
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, error: 'Staff email address is required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const staffUser = await dbGet('SELECT * FROM staff_users WHERE LOWER(email) = ?', [cleanEmail]);

    if (!staffUser) {
      return res.status(404).json({ success: false, error: 'No registered staff account found matching this email.' });
    }

    if (staffUser.status !== 'ACTIVE') {
      return res.status(403).json({ success: false, error: 'Account is inactive. Cannot reset password.' });
    }

    const verification = await createEmailVerification(cleanEmail);

    return res.json({
      success: true,
      message: `Password reset verification code dispatched to ${cleanEmail}.`,
      expiresAt: verification.expiresAt,
      devOtp: verification.otp
    });

  } catch (err) {
    console.error('Staff forgot password error:', err);
    return res.status(400).json({ success: false, error: err.message || 'Failed to dispatch reset verification code.' });
  }
}

/**
 * Reset Staff Password using Verified Email OTP Code
 */
export async function resetPasswordWithOTP(req, res) {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, error: 'Email, OTP code, and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, error: 'New password must be at least 6 characters long.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const staffUser = await dbGet('SELECT * FROM staff_users WHERE LOWER(email) = ?', [cleanEmail]);

    if (!staffUser) {
      return res.status(404).json({ success: false, error: 'No registered staff account found matching this email.' });
    }

    const verificationResult = await verifyEmailOTP(cleanEmail, otp.trim());
    if (!verificationResult.success) {
      return res.status(400).json({ success: false, error: verificationResult.message });
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    const now = new Date().toISOString();

    await dbRun(
      'UPDATE staff_users SET passwordHash = ?, updatedAt = ? WHERE id = ?',
      [newPasswordHash, now, staffUser.id]
    );

    // Audit log entry
    await dbRun(
      `INSERT INTO audit_logs (id, userId, action, entity, entityId, ipAddress, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [`audit_${Date.now()}`, staffUser.id, 'STAFF_PASSWORD_RESET', 'staff_users', staffUser.id, req.ip || '127.0.0.1', now]
    );

    return res.json({
      success: true,
      message: 'Password reset successfully! You can now log in with your new password.'
    });

  } catch (err) {
    console.error('Staff password reset error:', err);
    return res.status(500).json({ success: false, error: 'Server error during password reset.' });
  }
}
