import { UserRole } from '../models/User';
import { requireRole } from './auth';

export const requireRoles = (...allowedRoles: UserRole[]) => requireRole(allowedRoles);

export const requireMentor = () => requireRole(['mentor', 'admin']);
export const requireAdmin = () => requireRole(['admin']);
export const requireMentee = () => requireRole(['mentee']);
