import service from "../utils/request";

type userInfo = {
  email: string;
  name: string;
  password: string;
  role: "admin" | "merchant";
};

export const register = (userInfo: userInfo) => {
  return service.post("/api/user/register", userInfo);
};

export const login = (email: string, password: string) => {
  return service.post("/api/user/login", { email, password });
};
