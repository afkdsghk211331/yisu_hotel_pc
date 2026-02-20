import axios from "axios";
import { useUserStore } from "../store/userStore";

// 强制使用阿里云后端地址（开发和生产环境都使用）
const baseURL = "http://116.62.19.40:3001";

const service = axios.create({
  baseURL: baseURL,
  timeout: 5000,
});

// 请求拦截器：自动添加 token
service.interceptors.request.use(
  (config) => {
    const token = useUserStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 响应拦截器：处理 401 和自动提取 data
service.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // 处理 401 未授权
    if (error.response && error.response.status === 401) {
      const { clearAuth } = useUserStore.getState();
      clearAuth();
      // 跳转到登录页
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default service;
