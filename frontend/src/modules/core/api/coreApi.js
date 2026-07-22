import { request } from '../../../shared/api/client';

export function fetchStudents() {
  return request('/core/students');
}

export function createStudent(data) {
  return request('/core/students', { method: 'POST', body: data });
}

export function fetchCourses() {
  return request('/core/courses');
}

export function createCourse(data) {
  return request('/core/courses', { method: 'POST', body: data });
}

export function fetchDepartments() {
  return request('/core/departments');
}

export function createDepartment(data) {
  return request('/core/departments', { method: 'POST', body: data });
}

export function fetchFaculty() {
  return request('/core/faculty');
}

export function createFaculty(data) {
  return request('/core/faculty', { method: 'POST', body: data });
}
