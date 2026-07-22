import { request } from '../../../shared/api/client';

export const libraryApi = {
  getBooks: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const q = params.toString();
    return request(`/library/books${q ? `?${q}` : ''}`);
  },

  getBookById: async (id) => {
    return request(`/library/books/${id}`);
  },

  createBook: async (data) => {
    return request('/library/books', {
      method: 'POST',
      body: data
    });
  },

  updateBook: async (id, data) => {
    return request(`/library/books/${id}`, {
      method: 'PATCH',
      body: data
    });
  },

  issueBook: async (data) => {
    return request('/library/issue', {
      method: 'POST',
      body: data
    });
  },

  returnBook: async (borrowId, data = {}) => {
    return request(`/library/return/${borrowId}`, {
      method: 'POST',
      body: data
    });
  },

  getBorrows: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const q = params.toString();
    return request(`/library/borrows${q ? `?${q}` : ''}`);
  },

  getStudentBorrows: async (studentId) => {
    return request(`/library/student/${studentId}`);
  },

  getStats: async () => {
    return request('/library/stats');
  }
};
