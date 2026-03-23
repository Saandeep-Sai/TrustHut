import axios from 'axios';
import { auth } from '../firebase';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach Firebase ID token to every request (if user is logged in)
api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  console.log(user)
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ---- Posts ----
export const createPost = (data) => api.post('/posts/create/', data);
export const getPosts = () => api.get('/posts/');
export const getPost = (id) => api.get(`/posts/${id}/`);
export const updatePost = (id, data) => api.put(`/posts/update/${id}/`, data);
export const deletePost = (id) => api.delete(`/posts/delete/${id}/`);
export const searchPosts = (query) => api.get(`/posts/search/?q=${encodeURIComponent(query)}`);
export const getUserPosts = () => api.get('/posts/user/');

// ---- Likes ----
export const likePost = (postId) => api.post('/like/', { post_id: postId });
export const unlikePost = (postId) => api.post('/unlike/', { post_id: postId });
export const checkLike = (postId) => api.get(`/like/check/${postId}/`);

// ---- Users ----
export const registerUser = (data) => api.post('/users/register/', data);
export const getProfile = () => api.get('/users/profile/');
export const updateProfile = (data) => api.put('/users/profile/', data);

// ---- Chatbot ----
export const chatbotQuery = (query) => api.post('/chatbot/query/', { query });

export default api;
