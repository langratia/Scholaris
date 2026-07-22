import { request } from '../../../shared/api/client';

export function fetchClassrooms() {
  return request('/timetables/classrooms');
}

export function createClassroom(data) {
  return request('/timetables/classrooms', { method: 'POST', body: data });
}

export function fetchPeriods() {
  return request('/timetables/periods');
}

export function createPeriod(data) {
  return request('/timetables/periods', { method: 'POST', body: data });
}

export function fetchSessions() {
  return request('/timetables/sessions');
}

export function createSession(data) {
  return request('/timetables/sessions', { method: 'POST', body: data });
}

export function updateSessionStatus(id, status) {
  return request(`/timetables/sessions/${id}/status`, {
    method: 'PATCH',
    body: { status },
  });
}
