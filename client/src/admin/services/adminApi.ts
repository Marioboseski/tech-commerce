import { apiRequest } from '../../lib/apiClient';
import type { AdminStats } from '../types';

export const getAdminStats = () => apiRequest<AdminStats>('/api/admin/stats');
