import { AlertCircle, CheckCircle, Clock, LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { MerchantHotelResponse } from "@/api/hotel";

export type HotelStatus = MerchantHotelResponse["status"];

const statusConfig: Record<
  HotelStatus,
  { label: string; iconBgClass: string; badgeClass: string; icon: LucideIcon }
> = {
  published: {
    label: "已发布",
    iconBgClass: "bg-emerald-500",
    badgeClass: "bg-emerald-50/90 border-emerald-200 text-emerald-600",
    icon: CheckCircle,
  },
  pending: {
    label: "待审核",
    iconBgClass: "bg-blue-500",
    badgeClass: "bg-blue-50/90 border-blue-200 text-blue-600",
    icon: Clock,
  },
  rejected: {
    label: "已驳回",
    iconBgClass: "bg-red-500",
    badgeClass: "bg-red-50/90 border-red-200 text-red-500",
    icon: AlertCircle,
  },
  offline: {
    label: "已下线",
    iconBgClass: "bg-gray-500",
    badgeClass: "bg-gray-50/90 border-gray-200 text-gray-600",
    icon: AlertCircle,
  },
};

interface HotelStatusBadgeProps {
  status: HotelStatus;
  className?: string;
}

export function HotelStatusBadge({ status, className }: HotelStatusBadgeProps) {
  const config = statusConfig[status];
  if (!config) return null;

  const StatusIcon = config.icon;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn("rounded-full p-1 shadow-sm", config.iconBgClass)}>
        <StatusIcon className="h-4 w-4 text-white" />
      </div>
      <Badge
        variant="outline"
        className={cn("px-2 py-0.5 font-medium backdrop-blur-sm", config.badgeClass)}
      >
        {config.label}
      </Badge>
    </div>
  );
}
