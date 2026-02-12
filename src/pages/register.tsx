import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Hotel, Store, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { register } from "../api/user";

export function RegisterPage() {
  const [role, setRole] = useState<"merchant" | "admin" | null>(null);
  const [name, setname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const onRegister = async (userInfo: {
    name: string;
    email: string;
    password: string;
    role: "merchant" | "admin";
  }) => {
    try {
      const response = await register(userInfo);
      console.log("注册成功:", response);
    } catch (err) {
      console.error("注册失败:", err);
      setError("注册失败，请稍后再试");
    }
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!role) {
      setError("请选择角色类型");
      return;
    }

    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError("请填写所有必填字段");
      return;
    }

    if (password !== confirmPassword) {
      setError("两次输入的密码不一致");
      return;
    }

    if (password.length < 6) {
      setError("密码长度至少为6位");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("请输入有效的邮箱地址");
      return;
    }

    onRegister({ name, email, password, role });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 via-slate-50 to-neutral-100 p-4">
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-800 shadow-lg">
            <Hotel className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-semibold text-gray-900">易宿酒店</h1>
          <p className="mt-2 text-gray-600">创建您的账号，开始使用系统</p>
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle>注册</CardTitle>
            <CardDescription>选择角色类型并填写注册信息</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* 角色选择 */}
              <div className="space-y-3">
                <Label>选择角色类型</Label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setRole("merchant")}
                    className={cn(
                      "rounded-lg border-2 p-6 transition-all hover:border-neutral-400",
                      role === "merchant" ? "border-neutral-800 bg-neutral-50" : "border-gray-200",
                    )}
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div
                        className={cn(
                          "flex h-12 w-12 items-center justify-center rounded-full",
                          role === "merchant" ? "bg-neutral-800" : "bg-gray-200",
                        )}
                      >
                        <Store
                          className={cn(
                            "h-6 w-6",
                            role === "merchant" ? "text-white" : "text-gray-600",
                          )}
                        />
                      </div>
                      <div>
                        <div className="font-semibold">商户</div>
                        <div className="mt-1 text-xs text-gray-500">录入和管理酒店信息</div>
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole("admin")}
                    className={cn(
                      "rounded-lg border-2 p-6 transition-all hover:border-neutral-400",
                      role === "admin" ? "border-neutral-800 bg-neutral-50" : "border-gray-200",
                    )}
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div
                        className={cn(
                          "flex h-12 w-12 items-center justify-center rounded-full",
                          role === "admin" ? "bg-neutral-800" : "bg-gray-200",
                        )}
                      >
                        <ShieldCheck
                          className={cn(
                            "h-6 w-6",
                            role === "admin" ? "text-white" : "text-gray-600",
                          )}
                        />
                      </div>
                      <div>
                        <div className="font-semibold">管理员</div>
                        <div className="mt-1 text-xs text-gray-500">审核和管理酒店数据</div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* 注册表单 */}
              {role && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name">用户名 *</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="请输入用户名"
                      value={name}
                      onChange={(e) => setname(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">邮箱 *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="请输入邮箱"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="password">密码 *</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="请输入密码（至少6位）"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">确认密码 *</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="请再次输入密码"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full bg-neutral-800 hover:bg-neutral-900">
                    注册
                  </Button>
                </>
              )}

              <div className="text-center text-sm">
                <span className="text-gray-600">已有账号？</span>{" "}
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="font-medium text-neutral-800 hover:underline"
                >
                  立即登录
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
