import { MerchantHotelResponse } from "@/api/hotel";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Star, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { HotelStatusBadge } from "./HotelStatusBadge";
import { useHotelStore } from "@/store/hotelStore";

interface HotelCardProps {
  hotel: MerchantHotelResponse;
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
    <Card className={cn("p-0 gap-0 overflow-hidden border-none shadow-lg flex flex-col bg-white rounded-xl hover:-translate-y-1 transition-transform duration-300", className)}>
      {/* Top Image Section */}
      <div className="relative h-[180px] w-full shrink-0 group">
        <img
          src={hotel.cover_image}
          alt={hotel.name}
          className="w-full h-full object-cover brightness-90 group-hover:brightness-100 transition-all duration-300"
        />
        
        {/* Status Overlays */}
        <HotelStatusBadge status={hotel.status} className="absolute top-3 right-3" />
      </div>

      {/* Content Section */}
      <CardContent className="px-4 py-3 flex flex-col gap-3 flex-1">
        {/* Title Group */}
        <div className="flex flex-col mt-3">
          <h3 className="font-bold text-gray-900 leading-snug text-[20px] line-clamp-1">
            {hotel.name}
          </h3>
          <p className="text-[13px] text-gray-400 mt-0.5 line-clamp-1">
            {hotel.english_name}
          </p>
        </div>

        {/* Address */}
        <div className="flex items-start gap-1.5">
          <MapPin className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
          <span className="text-[13px] text-gray-500 line-clamp-1">
            {hotel.address}
          </span>
        </div>

        {/* Rating and Price */}
        <div className="flex flex-col gap-3 mt-auto pt-2">
          {/* Rating Badge */}
          <div className="bg-amber-50 border border-amber-100 rounded-md px-2 py-1 flex items-center gap-1.5 self-start">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={cn(
                    "w-3.5 h-3.5", 
                    i < hotel.star ? "fill-amber-400 text-amber-400" : "text-gray-200"
                  )} 
                />
              ))}
            </div>
            <span className="text-[12px] text-amber-600 font-semibold">
              {hotel.star}星级
            </span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-0.5 self-end">
            <span className="text-[12px] font-bold text-gray-900">¥</span>
            <span className="text-[20px] font-bold text-gray-900">{hotel.price}</span>
            <span className="text-[12px] text-gray-500 ml-0.5 font-normal">起</span>
          </div>
        </div>
      </CardContent>

      {/* Separator Line */}
      <div className="px-4">
        <div className="w-full h-px bg-gray-100" />
      </div>

      {/* Footer Action */}
      <CardFooter className="p-0 flex h-12">
        <Button 
          variant="ghost" 
          onClick={() => onEdit?.(hotel.id)}
          className="flex-1 h-full text-gray-500 hover:text-gray-700 hover:bg-gray-50/50 gap-2 font-medium text-[15px] rounded-none border-none shadow-none"
        >
          <Pencil className="w-4 h-4" />
          编辑详情
        </Button>
        <div className="w-px h-full bg-gray-100" />
        <Button 
          variant="ghost" 
          onClick={handleDelete}
          className="flex-1 h-full text-red-500 hover:text-red-700 hover:bg-red-50/50 gap-2 font-medium text-[15px] rounded-none border-none shadow-none"
        >
          <Trash2 className="w-4 h-4" />
          删除酒店
        </Button>
      </CardFooter>
    </Card>
  );
}
