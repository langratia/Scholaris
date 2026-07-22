import { request } from '../../../shared/api/client';

export const assignmentsApi = {
  getAll: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const queryString = params.toString();
    const endpoint = `/assignments${queryString ? `?${queryString}` : ''}`;
    return request(endpoint);
  },

  getById: async (id) => {
    return request(`/assignments/${id}`);
  },

  create: async (data) => {
    return request('/assignments', {
      method: 'POST',
      body: data
    });
  },

  updateStatus: async (id, status) => {
    return request(`/assignments/${id}/status`, {
      method: 'PATCH',
      body: { status }
    });
  },

  submit: async (assignmentId, studentId, data) => {
    return request(`/assignments/${assignmentId}/submit`, {
      method: 'POST',
      body: { ...data, studentId }
    });
  },

  grade: async (submissionId, data) => {
    return request(`/assignments/submissions/${submissionId}/grade`, {
      method: 'PATCH',
      body: data
    });
  }
};
