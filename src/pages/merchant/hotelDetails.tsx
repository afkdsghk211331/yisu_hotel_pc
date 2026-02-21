import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useHotelStore } from "@/store/hotelStore";
import { HotelBasicInfoForm } from "../../components/merchant/HotelBasicInfoForm";
import { RoomTypeManager } from "../../components/merchant/RoomTypeForm";
import { ChevronLeft, Loader2, SearchX } from "lucide-react";
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

  const isNew = id === "new" || window.location.pathname.endsWith("/new");

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
    rooms: [
      {
        name: "",
        price: 0,
        stock: 0,
        area: 1,
        bed_info: "",
        image: "",
      },
    ],
  };

  const form = useForm<HotelFormValues>({
    resolver: zodResolver(hotelSchema) as never,
    defaultValues: defaultFormValues,
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
        rooms: data.rooms?.map((room) => ({
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
    } catch (error) {
      const err = error as { message?: string };
      toast.error((isNew ? "创建失败: " : "更新失败: ") + (err.message || "请求服务器出错"));
    }
  };

  if (isLoading) {
    return (
      <div className="animate-in fade-in flex h-[70vh] flex-col items-center justify-center space-y-4 text-gray-400 duration-500">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
        <p className="text-sm font-medium tracking-wide">正在获取酒店数据，请稍候...</p>
      </div>
    );
  }

  if (!isNew && !currentHotel) {
    return (
      <div className="animate-in fade-in zoom-in-95 flex h-[70vh] flex-col items-center justify-center space-y-6 duration-500">
        <div className="rounded-full bg-red-50 p-6 shadow-sm ring-4 ring-red-50/50">
          <SearchX className="h-12 w-12 text-red-500" />
        </div>
        <div className="space-y-2 text-center">
          <h2 className="text-xl font-bold text-gray-900">未找到酒店信息</h2>
          <p className="text-sm text-gray-500">
            该酒店可能已被删除，或者链接地址有误，请返回列表重试。
          </p>
        </div>
        <Button
          onClick={() => navigate("/merchant/hotels")}
          className="min-w-[140px] bg-gray-800 text-white shadow-sm transition-all hover:bg-black"
        >
          返回我的酒店
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, (errors) => {
          console.error("Form Validation Errors:", errors);
          toast.error("表单校验失败，请检查填写内容");
        })}
        className="flex h-full flex-col space-y-6"
      >
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => navigate("/merchant/hotels")}
            >
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
          <Button type="submit" className="bg-gray-600 text-white hover:bg-gray-800">
            保存所有修改
          </Button>
        </div>

        {currentHotel?.reject_reason && (
          <div className="rounded-md border border-red-200 bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="flex items-center gap-2 text-sm font-medium text-red-800">
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
