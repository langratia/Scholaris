import { request } from '../../../shared/api/client';

export const fetchRegisters = () => request('/admissions/registers');
export const createRegister = (data) => request('/admissions/registers', { method: 'POST', body: data });
export const updateRegisterStatus = (id, status) =>
  request(`/admissions/registers/${id}/status`, { method: 'PATCH', body: { status } });

export const fetchApplications = (registerId) =>
  request(registerId ? `/admissions/applications?registerId=${registerId}` : '/admissions/applications');
export const createApplication = (data) => request('/admissions/applications', { method: 'POST', body: data });
export const updateApplicationStatus = (id, status) =>
  request(`/admissions/applications/${id}/status`, { method: 'PATCH', body: { status } });

export const checkApplicationStatus = (applicationNumber, email) =>
  request('/admissions/applications/status', { method: 'POST', body: { applicationNumber, email } });
