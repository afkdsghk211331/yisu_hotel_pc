import service from "../utils/request";

type RegisterData = {
  email: string;
  name: string;
  password: string;
  role: "admin" | "merchant";
};

type LoginData = {
  email: string;
  password: string;
};

// 后端实际返回结构：{ success: true, msg: '...', data: { token, role, username, id } }
type LoginResponse = {
  success: boolean;
  msg: string;
  data: {
    token: string;
    id: string;
    username: string;
    role: "merchant" | "admin" | "user";
  };
};

type UserInfoResponse = {
  id: string;
  name: string;
  email: string;
  role: "merchant" | "admin" | "user";
  avatar?: string;
};

export const register = (data: RegisterData) => {
  return service.post("/api/user/register", data);
};

export const login = (data: LoginData): Promise<LoginResponse> => {
  return service.post("/api/user/login", data);
};

export const getUserInfo = (): Promise<UserInfoResponse> => {
  return service.get("/api/user/info");
};
