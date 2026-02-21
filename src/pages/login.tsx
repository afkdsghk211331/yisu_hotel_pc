import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Hotel } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { login } from "../api/user";
import { useUserStore } from "../store/userStore";

export function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { setToken, setUserInfo } = useUserStore();

  const onLogin = async (email: string, password: string) => {
    setIsLoading(true);
    setError("");

    try {
      // request.ts 已经提取了 response.data，所以这里直接拿到的是后端返回的对象
      interface LoginResponse {
        success?: boolean;
        msg?: string;
        data?: {
          token: string;
          role: "user" | "merchant" | "admin";
          username: string;
          id: string | number;
        };
      }
      const response = (await login({ email, password })) as unknown as LoginResponse;

      console.log("登录接口返回:", response);

      // 检查后端返回的 success 字段
      if (response.success === false) {
        setError(response.msg || "登录失败，请检查您的账号和密码");
        return;
      }

      // 后端返回结构：{ success: true, msg: '...', data: { token, role, username, id } }
      const { data } = response;

      if (!data || !data.token) {
        setError("登录响应数据异常，请联系管理员");
        console.error("登录响应缺少必要字段:", response);
        return;
      }

      // 关键：校验用户角色，只允许 merchant 和 admin 登录
      if (data.role === "user") {
        setError("普通住客无法登录商家管理系统，请使用小程序端");
        return;
      }

      // 权限通过，保存 token 和用户信息
      setToken(data.token);
      setUserInfo({
        id: String(data.id),
        name: data.username,
        email: email,
        role: data.role,
      });

      console.log("✅ 登录成功，准备跳转");

      // 跳转到目标页面（如果有 from 则跳转回去，否则去首页）
      const state = location.state as { from?: { pathname: string } } | null | undefined;
      const from = state?.from?.pathname || "/home";
      navigate(from, { replace: true });
    } catch (err) {
      const errorObj = err as {
        message?: string;
        response?: { data?: { msg?: string; message?: string } };
        stack?: string;
      };
      console.error("❌ 登录崩溃:", err);
      console.error("错误详情:", {
        message: errorObj?.message,
        response: errorObj?.response,
        stack: errorObj?.stack,
      });

      // 尝试从多个可能的位置提取错误信息
      const errorMessage =
        errorObj?.response?.data?.msg ||
        errorObj?.response?.data?.message ||
        errorObj?.message ||
        "登录失败，请检查您的账号和密码";

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("请输入账号和密码");
      return;
    }

    onLogin(username, password);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 via-slate-50 to-neutral-100 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-800 shadow-lg">
            <Hotel className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-semibold text-gray-900">易宿酒店</h1>
          <p className="mt-2 text-gray-600">欢迎回来，请登录您的账号</p>
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle>登录</CardTitle>
            <CardDescription>使用您的邮箱登录系统</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="username">邮箱</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="请输入邮箱"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">密码</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="请输入密码"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-neutral-800 hover:bg-neutral-900"
                disabled={isLoading}
              >
                {isLoading ? "登录中..." : "登录"}
              </Button>

              <div className="text-center text-sm">
                <span className="text-gray-600">还没有账号？</span>{" "}
                <button
                  type="button"
                  onClick={() => navigate("/register")}
                  className="font-medium text-neutral-800 hover:underline"
                >
                  立即注册
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
