import api from './api';

const notificationService = {
  getAll: (params = {}) => api.get('/notifications', { params }).then(r => r.data),
  getCount: () => api.get('/notifications/count').then(r => r.data.count),
  markRead: (id) => api.patch(`/notifications/${id}/read`).then(r => r.data),
  markAllRead: () => api.patch('/notifications/read-all').then(r => r.data),
  deleteOne: (id) => api.delete(`/notifications/${id}`).then(r => r.data),
  clearAll: () => api.delete('/notifications/clear-all').then(r => r.data),
};

export default notificationService;
