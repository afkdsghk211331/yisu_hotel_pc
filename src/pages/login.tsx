import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Hotel } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/user";

export function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const onLogin = async (email: string, password: string) => {
    try {
      const response = await login(email, password);
      console.log("登录成功:", response);
      navigate("/home");
    } catch (err) {
      console.error("登录失败:", err);
      setError("登录失败，请检查您的账号和密码");
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

              <Button type="submit" className="w-full bg-neutral-800 hover:bg-neutral-900">
                登录
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
