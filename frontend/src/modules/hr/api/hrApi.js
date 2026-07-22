import { request } from '../../../shared/api/client';

export const hrApi = {
  getStats: () => request('/hr/stats'),

  getEmployees: (filters = {}) => {
    const q = new URLSearchParams(filters).toString();
    return request(`/hr/employees${q ? `?${q}` : ''}`);
  },

  getEmployeeById: (id) => request(`/hr/employees/${id}`),

  createEmployee: (data) => request('/hr/employees', { method: 'POST', body: data }),

  updateEmployee: (id, data) => request(`/hr/employees/${id}`, { method: 'PATCH', body: data }),

  getLeaves: (filters = {}) => {
    const q = new URLSearchParams(filters).toString();
    return request(`/hr/leaves${q ? `?${q}` : ''}`);
  },

  submitLeave: (employeeId, data) =>
    request(`/hr/employees/${employeeId}/leave`, { method: 'POST', body: data }),

  reviewLeave: (id, data) =>
    request(`/hr/leaves/${id}/review`, { method: 'PATCH', body: data }),
};
