import { request } from '../../../shared/api/client';

export function fetchExams() {
  return request('/exams/schedules');
}

export function fetchExamById(id) {
  return request(`/exams/schedules/${id}`);
}

export function createExam(data) {
  return request('/exams/schedules', { method: 'POST', body: data });
}

export function updateExamStatus(id, status) {
  return request(`/exams/schedules/${id}/status`, {
    method: 'PATCH',
    body: { status },
  });
}

export function saveBulkResults(examScheduleId, results) {
  return request(`/exams/schedules/${examScheduleId}/results`, {
    method: 'POST',
    body: { results },
  });
}

export function fetchExamResultsByStudent(studentId) {
  return request(`/exams/results/student/${studentId}`);
}

export function fetchExamStats() {
  return request('/exams/stats');
}
