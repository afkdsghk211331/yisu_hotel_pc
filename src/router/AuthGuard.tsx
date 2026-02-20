import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useUserStore } from "../store/userStore";
import { getUserInfo } from "../api/user";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const location = useLocation();
  const { token, userInfo, setUserInfo, clearAuth } = useUserStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      // 如果没有 token，直接跳转登录
      if (!token) {
        setIsLoading(false);
        setIsAuthenticated(false);
        return;
      }

      // 如果有 token 但没有 userInfo，尝试获取用户信息
      if (!userInfo) {
        try {
          const info = await getUserInfo();
          setUserInfo(info);
          setIsAuthenticated(true);
        } catch (error) {
          console.error("获取用户信息失败:", error);
          clearAuth();
          setIsAuthenticated(false);
        } finally {
          setIsLoading(false);
        }
      } else {
        // 有 token 也有 userInfo，直接通过
        setIsAuthenticated(true);
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [token, userInfo, setUserInfo, clearAuth]);

  // 加载中显示空白或加载动画
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-gray-600">加载中...</div>
      </div>
    );
  }

  // 未认证跳转到登录页，并保存当前路径
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
