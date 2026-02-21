import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Shield, Camera } from "lucide-react";
import { useUserStore } from "@/store/userStore";

export function SettingsPage() {
  const { userInfo } = useUserStore();
  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">账号设置</h2>
        <p className="mt-1 text-gray-500">管理您的账号信息</p>
      </div>

      <div className="space-y-6">
        {/* 个人信息卡片 */}
        <Card>
          <CardHeader>
            <CardTitle>个人信息</CardTitle>
            <CardDescription>您的基本账号信息</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 头像 */}
            <div className="flex items-center gap-6">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarFallback className="bg-blue-100 text-2xl text-blue-600">
                    {userInfo?.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <button className="absolute right-0 bottom-0 rounded-full bg-blue-600 p-2 text-white transition-colors hover:bg-blue-700">
                  <Camera className="h-4 w-4" />
                </button>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{userInfo?.name}</h3>
                <div className="mt-1 flex items-center gap-2">
                  <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">
                    <Shield className="mr-1 h-3 w-3" />
                    {userInfo?.role === "merchant" ? "商户" : "管理员"}
                  </Badge>
                </div>
                <p className="mt-2 text-sm text-gray-500">点击头像上的相机图标可以更换头像</p>
              </div>
            </div>

            <div className="space-y-4 border-t pt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">用户名</Label>
                  <div className="relative">
                    <User className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                    <Input
                      id="username"
                      value={userInfo?.name || ""}
                      disabled
                      className="bg-gray-50 pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">账号类型</Label>
                  <Input
                    id="role"
                    value={userInfo?.role === "merchant" ? "商户" : "管理员"}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">邮箱</Label>
                <div className="relative">
                  <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                  <Input id="email" type="email" value={userInfo?.email} className="pl-10" />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline">取消</Button>
                <Button>保存更改</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
