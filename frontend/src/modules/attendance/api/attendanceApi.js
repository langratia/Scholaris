import { request } from '../../../shared/api/client';

export function fetchAttendanceStats() {
  return request('/attendance/stats');
}

export function fetchAttendanceSheets() {
  return request('/attendance/sheets');
}

export function fetchAttendanceSheetById(id) {
  return request(`/attendance/sheets/${id}`);
}

export function createAttendanceSheet(data) {
  return request('/attendance/sheets', { method: 'POST', body: data });
}

export function updateSheetStatus(id, status) {
  return request(`/attendance/sheets/${id}/status`, {
    method: 'PATCH',
    body: { status },
  });
}

export function updateAttendanceLine(lineId, status, remark) {
  return request(`/attendance/lines/${lineId}`, {
    method: 'PATCH',
    body: { status, remark },
  });
}
