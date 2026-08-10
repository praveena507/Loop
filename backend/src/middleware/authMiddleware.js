import jwt from 'jsonwebtoken';
import { dbGet } from '../db/initDb.js';

const JWT_SECRET = process.env.JWT_SECRET || 'loop_super_secret_jwt_key_2026_spec';

/**
 * Middleware to authenticate staff JWT tokens.
 */
export async function authenticateStaff(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Unauthorized: Access token missing or invalid format.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const staffUser = await dbGet('SELECT id, name, email, role, status FROM staff_users WHERE id = ?', [decoded.id]);

    if (!staffUser || staffUser.status !== 'ACTIVE') {
      return res.status(401).json({ success: false, error: 'Unauthorized: Account is inactive or user not found.' });
    }

    req.user = staffUser;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Unauthorized: Invalid or expired token.' });
  }
}

/**
 * Middleware to restrict route access exclusively to ADMIN role.
 */
export function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ success: false, error: 'Forbidden: Admin privilege required.' });
  }
  next();
}
