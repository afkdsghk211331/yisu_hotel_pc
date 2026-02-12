import axios from "axios";

const baseURL = import.meta.env.PROD ? "http://116.62.19.40:3001" : "http://localhost:3001";

const service = axios.create({
  baseURL: baseURL,
  timeout: 5000,
});

service.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(error),
);

export default service;
