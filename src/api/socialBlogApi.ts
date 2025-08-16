// src/api/socialBlogApi.ts
import axios from "axios";

const SOCIAL_BASE = "https://social-blog-server-6g7j.onrender.com/api";

export const socialApi = axios.create({
  baseURL: SOCIAL_BASE,
});

// Attach Social Blog JWT automatically if available
socialApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("socialToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
