import { Hotel } from "@/api/hotel";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Star, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { HotelStatusBadge } from "./HotelStatusBadge";
import { useHotelStore } from "@/store/hotelStore";

interface HotelCardProps {
  hotel: Hotel;
  onEdit?: (id: number) => void;
  className?: string;
}

export function HotelCard({ hotel, onEdit, className }: HotelCardProps) {
  const { deleteHotel } = useHotelStore();

  const handleDelete = () => {
    if (window.confirm(`确认要删除酒店 "${hotel.name}" 吗？此操作不可恢复。`)) {
      deleteHotel(hotel.id);
    }
  };

  return (
    <Card
      className={cn(
        "flex flex-col gap-0 overflow-hidden rounded-xl border-none bg-white p-0 shadow-lg transition-transform duration-300 hover:-translate-y-1",
        className,
      )}
    >
      {/* Top Image Section */}
      <div className="group relative h-45 w-full shrink-0">
        <img
          src={hotel.cover_image}
          alt={hotel.name}
          className="h-full w-full object-cover brightness-90 transition-all duration-300 group-hover:brightness-100"
        />

        {/* Status Overlays */}
        <HotelStatusBadge status={hotel.status} className="absolute top-3 right-3" />
      </div>

      {/* Content Section */}
      <CardContent className="flex flex-1 flex-col gap-3 px-4 py-3">
        {/* Title Group */}
        <div className="mt-3 flex flex-col">
          <h3 className="line-clamp-1 text-[20px] leading-snug font-bold text-gray-900">
            {hotel.name}
          </h3>
          <p className="mt-0.5 line-clamp-1 text-[13px] text-gray-400">{hotel.english_name}</p>
        </div>

        {/* Address */}
        <div className="flex items-start gap-1.5">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
          <span className="line-clamp-1 text-[13px] text-gray-500">{hotel.address}</span>
        </div>

        {/* Rating and Price */}
        <div className="mt-auto flex flex-col gap-3 pt-2">
          {/* Rating Badge */}
          <div className="flex items-center gap-1.5 self-start rounded-md border border-amber-100 bg-amber-50 px-2 py-1">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-3.5 w-3.5",
                    i < hotel.star ? "fill-amber-400 text-amber-400" : "text-gray-200",
                  )}
                />
              ))}
            </div>
            <span className="text-[12px] font-semibold text-amber-600">{hotel.star}星级</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-0.5 self-end">
            <span className="text-[12px] font-bold text-gray-900">¥</span>
            <span className="text-[20px] font-bold text-gray-900">{hotel.price}</span>
            <span className="ml-0.5 text-[12px] font-normal text-gray-500">起</span>
          </div>
        </div>
      </CardContent>

      {/* Separator Line */}
      <div className="px-4">
        <div className="h-px w-full bg-gray-100" />
      </div>

      {/* Footer Action */}
      <CardFooter className="flex h-12 p-0">
        <Button
          variant="ghost"
          onClick={() => onEdit?.(hotel.id)}
          className="h-full flex-1 gap-2 rounded-none border-none text-[15px] font-medium text-gray-500 shadow-none hover:bg-gray-50/50 hover:text-gray-700"
        >
          <Pencil className="h-4 w-4" />
          编辑详情
        </Button>
        <div className="h-full w-px bg-gray-100" />
        <Button
          variant="ghost"
          onClick={handleDelete}
          className="h-full flex-1 gap-2 rounded-none border-none text-[15px] font-medium text-red-500 shadow-none hover:bg-red-50/50 hover:text-red-700"
        >
          <Trash2 className="h-4 w-4" />
          删除酒店
        </Button>
      </CardFooter>
    </Card>
  );
}
