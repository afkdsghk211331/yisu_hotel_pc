import { Button } from "@/components/ui/button";
import { Plus, Info, AlertTriangle } from "lucide-react";
import { HotelCard } from "@/components/merchant/HotelCard";
import { useNavigate } from "react-router-dom";
import { useHotelStore } from "@/store/hotelStore";
import { useEffect } from "react";
import { Hotel } from "@/api/hotel";

export default function MerchantHotelsPage() {
  const navigate = useNavigate();

  // 使用 Selector 提取状态，优化性能
  const hotelList = useHotelStore((state) => state.hotelList);
  const isLoading = useHotelStore((state) => state.isLoading);
  const error = useHotelStore((state) => state.error);
  const fetchHotelList = useHotelStore((state) => state.fetchHotelList);

  useEffect(() => {
    fetchHotelList();
  }, [fetchHotelList]);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 p-6 py-6 md:px-8">
      {/* 头部区域 */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">我的酒店</h1>
          <p className="text-sm text-gray-500">管理您的酒店房型、价格及基础信息。</p>
        </div>
        <Button
          onClick={() => navigate("/merchant/hotels/new")}
          className="h-11 px-6 font-semibold text-white shadow-md transition-all hover:shadow-lg"
        >
          <Plus className="mr-2 h-5 w-5" /> 新增酒店
        </Button>
      </div>

      {/* 酒店列表网格 */}
      {error ? (
        <div className="flex flex-col items-center justify-center rounded-2xl px-4 py-20 text-center">
          <div className="mb-4 rounded-full bg-white p-4 shadow-sm">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-red-900">获取数据失败</h3>
          <p className="mt-2 mb-6 max-w-xs text-sm text-red-600">{error}</p>
          <Button variant="outline" onClick={() => fetchHotelList()}>
            重试一次
          </Button>
        </div>
      ) : isLoading ? (
        <div className="flex flex-col items-center justify-center rounded-2xl py-20">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-400 border-t-transparent" />
          <p className="text-gray-500">正在获取酒店列表...</p>
        </div>
      ) : hotelList.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-transparent px-4 py-20 text-center">
          <div className="mb-4 rounded-full bg-white p-4 shadow-sm">
            <Info className="h-8 w-8 text-gray-300" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">暂无酒店数据</h3>
          <p className="mt-2 mb-6 max-w-xs text-sm text-gray-500">
            您还没有创建任何酒店。点击右上角的按钮开始您的第一个酒店项目吧。
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {hotelList.map((hotel: Hotel) => (
            <HotelCard
              key={hotel.id}
              hotel={hotel}
              onEdit={(id) => navigate(`/merchant/hotels/${id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
