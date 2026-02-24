import axios from "axios";
import { useUserStore } from "../store/userStore";

// 用户服务后端（登录注册等，3001 端口）
const userBaseURL = "http://116.62.19.40:3001";
// 酒店业务后端（商家酒店管理，3005 端口）
const hotelBaseURL = "http://116.62.19.40:3005";

// 本地测试地址
// const userBaseURL = "http://localhost:3001";
// const hotelBaseURL = "http://localhost:3005";

// 创建拦截器配置函数
const createInterceptors = (instance: ReturnType<typeof axios.create>) => {
  // 请求拦截器：自动添加 token
  instance.interceptors.request.use(
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
  instance.interceptors.response.use(
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
};

// 用户服务实例（3001 端口）
export const userService = axios.create({
  baseURL: userBaseURL,
  timeout: 5000,
});
createInterceptors(userService);

// 酒店服务实例（3005 端口）
export const hotelService = axios.create({
  baseURL: hotelBaseURL,
  timeout: 5000,
});
createInterceptors(hotelService);

// 默认导出酒店服务（保持向后兼容）
export default hotelService;
