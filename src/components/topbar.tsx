import { Hotel, ChevronDown, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useUserStore } from "@/store/userStore";

export function TopBar() {
  const { userInfo: user, clearAuth } = useUserStore();
  return (
    <div className="sticky top-0 z-50 flex h-16 items-center justify-between border-b bg-white px-6">
      <div className="flex items-center gap-3">
        <Hotel className="h-8 w-8 text-black" />
        <h1 className="text-xl font-semibold">易宿酒店</h1>
      </div>

      {user && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-blue-100 text-blue-600">
                  {user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="text-left">
                <div className="text-sm font-medium">{user.name}</div>
                <div className="text-xs text-gray-500">
                  {user.role === "merchant" ? "商户" : "管理员"}
                </div>
              </div>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>账号信息</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled className="text-xs text-gray-500">
              {user.email}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={clearAuth} className="text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              退出登录
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
