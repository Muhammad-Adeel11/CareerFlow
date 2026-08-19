import api from './api';

export const getUsers = () => api.get('/admin/users').then((res) => res.data);
export const deleteUser = (id) => api.delete(`/admin/users/${id}`).then((res) => res.data);
export const getSystemStats = () => api.get('/admin/stats').then((res) => res.data);
