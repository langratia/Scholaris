import { request } from '../../../shared/api/client';

export const fetchFinanceSummary = () => request('/finance/summary');

export const fetchFeeTerms = () => request('/finance/terms');
export const createFeeTerm = (data) => request('/finance/terms', { method: 'POST', body: data });

export const fetchStudentFees = () => request('/finance/fees');
export const assignStudentFee = (data) => request('/finance/fees/assign', { method: 'POST', body: data });
export const recordPayment = (id, amount) =>
  request(`/finance/fees/${id}/pay`, { method: 'POST', body: { amount } });
export const updateFeeStatus = (id, status) =>
  request(`/finance/fees/${id}/status`, { method: 'PATCH', body: { status } });
