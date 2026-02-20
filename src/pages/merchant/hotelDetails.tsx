import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useHotelStore } from "@/store/hotelStore";
import { HotelBasicInfoForm } from "../../components/merchant/HotelBasicInfoForm";
import { RoomTypeManager } from "../../components/merchant/RoomTypeForm";
import { ChevronLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { hotelSchema, HotelFormValues } from "@/schema/hotel";
import { Form } from "@/components/ui/form";

import { updateMerchantHotel, createMerchantHotel, MerchantHotelRequest } from "@/api/hotel";
import { toast } from "sonner";

export default function EditHotelPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentHotel, fetchHotelDetail, isLoading, clearCurrentHotel } = useHotelStore();

  const isNew = id === 'new' || window.location.pathname.endsWith('/new');

  const defaultFormValues: HotelFormValues = {
    name: "",
    english_name: "",
    address: "",
    star: 5,
    open_date: "",
    description: "",
    tags: [],
    cover_image: "",
    detail_images: [],
    rooms: []
  };

  const form = useForm<HotelFormValues>({
    resolver: zodResolver(hotelSchema) as any,
    defaultValues: defaultFormValues
  });

  useEffect(() => {
    if (isNew) {
      clearCurrentHotel();
      form.reset(defaultFormValues);
    } else if (id) {
      fetchHotelDetail(Number(id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, fetchHotelDetail, clearCurrentHotel, isNew]);

  useEffect(() => {
    if (currentHotel && !isNew) {
      form.reset({
        ...currentHotel,
        open_date: currentHotel.open_date || "",
        tags: currentHotel.tags || [],
        detail_images: currentHotel.detail_images || [],
        rooms: currentHotel.rooms || [],
      } as HotelFormValues);
    }
  }, [currentHotel, form, isNew]);

  const onSubmit = async (data: HotelFormValues) => {
    try {
      const apiData: MerchantHotelRequest = {
        name: data.name,
        english_name: data.english_name,
        address: data.address,
        star: data.star,
        description: data.description,
        cover_image: data.cover_image,
        detail_images: data.detail_images,
        open_date: data.open_date,
        tags: data.tags,
        rooms: data.rooms?.map(room => ({
          ...room,
          id: room.id || undefined, // undefined prevents sending dirty temp ids to api for creation
        })),
      };

      if (isNew) {
        await createMerchantHotel(apiData);
        toast.success("创建成功");
      } else {
        await updateMerchantHotel(Number(id), apiData);
        toast.success("更新成功");
      }
      navigate("/merchant/hotels");
    } catch (error: any) {
      toast.error((isNew ? "创建失败: " : "更新失败: ") + (error.message || "请求服务器出错"));
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">正在加载酒店详情...</div>;
  }

  if (!isNew && !currentHotel) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 mb-4">酒店不存在或获取失败</p>
        <Button onClick={() => navigate("/merchant/hotels")}>返回我的酒店</Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex h-full flex-col space-y-6">
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-4">
            <Button type="button" variant="ghost" size="icon" onClick={() => navigate("/merchant/hotels")}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {currentHotel?.name || "新增酒店"}
              </h1>
              {currentHotel?.english_name && (
                <p className="text-sm text-gray-500">{currentHotel.english_name}</p>
              )}
            </div>
          </div>
          <Button type="submit" className="bg-gray-600 hover:bg-gray-800 text-white">
            保存所有修改
          </Button>
        </div>

      {currentHotel?.reject_reason && (
        <div className="rounded-md bg-red-50 p-4 border border-red-200">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-100 text-red-600">
                  ×
                </span>
                审核被驳回
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{currentHotel.reject_reason}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6">
        <HotelBasicInfoForm />
        <RoomTypeManager />
      </div>
      </form>
    </Form>
  );
}
