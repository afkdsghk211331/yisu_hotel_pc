import { Hotel, Settings, ChevronDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/store/userStore";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useHotelStore } from "@/store/hotelStore";
import { useEffect } from "react";
import type { LucideIcon } from "lucide-react";

interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  path: string;
}

interface MenuItemWithChildren extends MenuItem {
  children: (MenuItem | ChildMenuItem)[];
}

interface ChildMenuItem {
  id: string;
  label: string;
  path: string;
  icon?: LucideIcon;
}

export function Sidebar() {
  const { userInfo } = useUserStore();
  const role = userInfo?.role;
  const { hotelList, fetchHotelList } = useHotelStore();

  useEffect(() => {
    if (role === "merchant") {
      fetchHotelList();
    }
  }, [role, fetchHotelList]);

  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    "hotel-management": true,
  });

  const toggleMenu = (id: string) => {
    setOpenMenus((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const merchantMenuItems: (MenuItem | MenuItemWithChildren)[] = [
    { 
      id: "hotel-management", 
      label: "我的酒店", 
      icon: Hotel, 
      path: "/merchant/hotels",
      children: [
        ...hotelList.map(h => ({
          id: `hotel-${h.id}`,
          label: h.name,
          path: `/merchant/hotels/${h.id}`
        })),
        {
          id: "hotel-new",
          label: "新增酒店",
          icon: Plus,
          path: "/merchant/hotels/new"
        }
      ]
    },
    { id: "account-settings", label: "账号设置", icon: Settings, path: "/account/settings" },
  ];

  const adminMenuItems: MenuItem[] = [
    { id: "hotel-list", label: "酒店列表", icon: Hotel, path: "/hotel/review" },
    { id: "account-settings", label: "账号设置", icon: Settings, path: "/account/settings" },
  ];

  const menuItems = role === "merchant" ? merchantMenuItems : adminMenuItems;

  return (
    <div className="sticky top-16 h-[calc(100vh-4rem)] w-64 border-r bg-white">
      <nav className="space-y-2 p-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          
          if ('children' in item && item.children) {
            const isOpen = openMenus[item.id];
            // If we are exactly on the list page or within one of its children
            const isActive = pathname === item.path || pathname.startsWith(item.path);

            return (
              <Collapsible
                key={item.id}
                open={isOpen}
                onOpenChange={() => toggleMenu(item.id)}
                className="w-full space-y-1"
              >
                <div 
                  className={cn(
                    "flex items-center w-full rounded-lg transition-colors overflow-hidden",
                    isActive ? "bg-accent" : "hover:bg-gray-50"
                  )}
                >
                  <button
                    onClick={() => navigate(item.path)}
                    className={cn(
                      "flex flex-1 items-center gap-3 px-4 py-3 transition-colors",
                      isActive ? "text-accent-foreground font-medium" : "text-gray-700"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium text-sm">{item.label}</span>
                  </button>
                  <CollapsibleTrigger 
                    className={cn(
                      "p-3 transition-colors rounded-none",
                      isActive ? "hover:bg-accent-foreground/5" : "hover:bg-gray-100",
                      "text-gray-500"
                    )}
                  >
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform duration-200",
                        isOpen ? "rotate-180" : ""
                      )}
                    />
                  </CollapsibleTrigger>
                </div>
                <CollapsibleContent className="space-y-1">
                  {(item as MenuItemWithChildren).children.map((child: ChildMenuItem) => {
                    const isChildActive = pathname === child.path;
                    const ChildIcon = child.icon;
                    return (
                      <button
                        key={child.id}
                        onClick={() => navigate(child.path)}
                        className={cn(
                          "flex w-full flex-row items-center gap-2 rounded-lg pl-12 pr-4 py-2.5 text-sm transition-colors",
                          isChildActive
                            ? "bg-accent/50 text-accent-foreground font-medium"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        )}
                      >
                        {ChildIcon && <ChildIcon className="h-4 w-4" />}
                        <span className="truncate">{child.label}</span>
                      </button>
                    );
                  })}
                </CollapsibleContent>
              </Collapsible>
            );
          }

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
