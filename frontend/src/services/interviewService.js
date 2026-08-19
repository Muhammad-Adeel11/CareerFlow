import api from './api';

export const getInterviews = (params) => api.get('/interviews', { params }).then((res) => res.data);
export const createInterview = (payload) => api.post('/interviews', payload).then((res) => res.data);
export const updateInterview = (id, payload) => api.put(`/interviews/${id}`, payload).then((res) => res.data);
export const deleteInterview = (id) => api.delete(`/interviews/${id}`).then((res) => res.data);
