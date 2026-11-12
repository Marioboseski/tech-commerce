import { apiRequest } from '../lib/apiClient';
import type { ApiCategory } from '../types/category';

export const getCategories = () => apiRequest<ApiCategory[]>('/api/categories');
