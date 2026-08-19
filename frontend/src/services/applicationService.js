import api from './api';

export const getApplications = (params) => api.get('/applications', { params }).then((res) => res.data);
export const getApplication = (id) => api.get(`/applications/${id}`).then((res) => res.data);
export const createApplication = (payload) => api.post('/applications', payload).then((res) => res.data);
export const updateApplication = (id, payload) => api.put(`/applications/${id}`, payload).then((res) => res.data);
export const deleteApplication = (id) => api.delete(`/applications/${id}`).then((res) => res.data);
export const getApplicationStats = () => api.get('/applications/stats').then((res) => res.data);
