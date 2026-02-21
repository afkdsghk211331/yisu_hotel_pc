import { Hotel, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/store/userStore";
import { useLocation, useNavigate } from "react-router-dom";

export function Sidebar() {
  const { userInfo } = useUserStore();
  const role = userInfo?.role;

  const navigate = useNavigate();
  const { pathname } = useLocation();

  const merchantMenuItems = [
    { id: "account-settings", label: "账号设置", icon: Settings, path: "/account/settings" },
  ];

  const adminMenuItems = [
    { id: "hotel-list", label: "酒店列表", icon: Hotel, path: "/hotel/review" },
    { id: "account-settings", label: "账号设置", icon: Settings, path: "/account/settings" },
  ];

  const menuItems = role === "merchant" ? merchantMenuItems : adminMenuItems;

  return (
    <div className="sticky top-16 h-[calc(100vh-4rem)] w-64 border-r bg-white">
      <nav className="space-y-2 p-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.path);

          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-4 py-3 transition-colors",
                isActive ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-50",
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
