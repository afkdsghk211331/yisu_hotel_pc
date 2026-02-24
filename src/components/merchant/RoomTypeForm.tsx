import { Button } from "@/components/ui/button";
import { useFormContext, useFieldArray } from "react-hook-form";
import { HotelFormValues } from "@/schema/hotel";
import {
  CheckCircle2,
  Plus,
  Trash2,
  BedDouble,
  AreaChart,
  CircleDollarSign,
  Grid2x2,
  UploadCloud,
} from "lucide-react";
import { Dropzone, DropZoneArea, DropzoneTrigger, useDropzone } from "@/components/ui/dropzone";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { uploadImage, deleteImage } from "@/api/upload";
import { toast } from "sonner";

export function RoomTypeManager() {
  const form = useFormContext<HotelFormValues>();
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "rooms",
  });

  const handleAddRoom = () => {
    append({
      name: "",
      price: 0,
      stock: 0,
      area: 0,
      bed_info: "",
      image: "",
    });
  };

  const roomsError = form.formState.errors.rooms as
    | { root?: { message?: string }; message?: string }
    | undefined;
  const arrayErrorMsg =
    roomsError?.root?.message ||
    (roomsError && !Array.isArray(roomsError) ? roomsError.message : "");

  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900">
          <CheckCircle2 className="h-5 w-5 text-gray-700" />
          房型配置
        </h2>
        <Button
          type="button"
          onClick={handleAddRoom}
          className="gap-2 bg-gray-800 text-white shadow-sm transition-colors hover:bg-black"
        >
          <Plus className="h-4 w-4" />
          新增房型
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {fields.map((field, index) => (
          <RoomCard key={field.id} index={index} onDelete={() => remove(index)} />
        ))}
      </div>

      {arrayErrorMsg && (
        <p className="text-destructive mt-4 block text-center text-sm font-medium">
          {arrayErrorMsg}
        </p>
      )}
    </div>
  );
}

function RoomCard({ index, onDelete }: { index: number; onDelete: () => void }) {
  const form = useFormContext<HotelFormValues>();

  const imageField = `rooms.${index}.image` as const;
  const currentImage = form.watch(`rooms.${index}.image`);

  const imageDropzone = useDropzone({
    onDropFile: async (file) => {
      try {
        const url = await uploadImage(file);
        form.setValue(imageField, url, { shouldValidate: true });
        return { status: "success", result: url };
      } catch (error) {
        console.error("房型图上传失败:", error);
        return { status: "error", error: "上传失败" };
      }
    },
    validation: {
      accept: { "image/*": [] },
      maxFiles: 1,
    },
  });

  const removeRoomImage = async () => {
    const imageUrl = currentImage;
    if (!imageUrl) return;

    try {
      await deleteImage(imageUrl);
      form.setValue(imageField, "", { shouldValidate: true });
      toast.success("房型图片删除成功");
    } catch (error) {
      console.error("删除房型图片失败:", error);
      toast.error("删除房型图片失败，请重试");
    }
  };

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border bg-gray-50 transition-shadow hover:shadow-md">
      <div className="group relative h-40 bg-gray-200">
        {currentImage ? (
          <>
            <img src={currentImage} alt="room cover" className="h-full w-full object-cover" />
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={removeRoomImage}
              >
                删除并重新上传
              </Button>
            </div>
          </>
        ) : (
          <Dropzone {...imageDropzone}>
            <DropZoneArea className="relative flex h-full w-full flex-col items-center justify-center rounded-none border-none bg-gray-50 transition-colors hover:bg-gray-100">
              <DropzoneTrigger
                className="absolute inset-0 z-10 m-0! h-full w-full cursor-pointer rounded-none border-none bg-transparent p-0! opacity-0 hover:bg-transparent"
                aria-label="点击上传房型图片"
              />
              <UploadCloud className="pointer-events-none mb-2 h-6 w-6 text-gray-400" />
              <span className="pointer-events-none text-xs font-medium text-gray-700 transition-colors group-hover:text-gray-900">
                点击上传房型图片
              </span>
            </DropZoneArea>
          </Dropzone>
        )}
      </div>

      <div className="flex flex-1 flex-col space-y-3 p-4">
        {/* Room Name */}
        <FormField
          control={form.control}
          name={`rooms.${index}.name`}
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormLabel required className="text-sm">
                房型名称
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="请输入房型名称"
                  className="h-8 w-full bg-white px-3 text-sm"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-sm" />
            </FormItem>
          )}
        />

        {/* Bed Info */}
        <FormField
          control={form.control}
          name={`rooms.${index}.bed_info`}
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormLabel required className="text-sm">
                床型
              </FormLabel>
              <div className="relative">
                <BedDouble className="absolute top-2 left-2.5 h-4 w-4 text-gray-400" />
                <FormControl>
                  <Input
                    placeholder="例如: 1张2米特大床"
                    className="h-8 w-full bg-white pr-3 pl-8 text-sm text-gray-900"
                    {...field}
                  />
                </FormControl>
              </div>
              <FormMessage className="text-sm" />
            </FormItem>
          )}
        />

        {/* Number, Price, Area Grid */}
        <div className="mt-1 grid flex-1 grid-cols-2 items-start gap-3">
          <FormField
            control={form.control}
            name={`rooms.${index}.stock`}
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel required className="text-sm text-gray-500">
                  数量
                </FormLabel>
                <div className="relative">
                  <Grid2x2 className="absolute top-2 left-2.5 h-4 w-4 text-gray-400" />
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      className="h-8 w-full bg-white pr-3 pl-8 text-sm"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      onFocus={(e) => e.target.value === "0" && (e.target.value = "")}
                      onBlur={(e) => e.target.value === "" && field.onChange(0)}
                    />
                  </FormControl>
                </div>
                <FormMessage className="text-sm" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={`rooms.${index}.price`}
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel required className="text-sm text-gray-500">
                  价格 (¥)
                </FormLabel>
                <div className="relative">
                  <CircleDollarSign className="absolute top-2 left-2.5 h-4 w-4 text-gray-400" />
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      className="h-8 w-full bg-white pr-3 pl-8 text-sm"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      onFocus={(e) => e.target.value === "0" && (e.target.value = "")}
                      onBlur={(e) => e.target.value === "" && field.onChange(0)}
                    />
                  </FormControl>
                </div>
                <FormMessage className="text-sm" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={`rooms.${index}.area`}
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel required className="text-sm text-gray-500">
                  面积 (m²)
                </FormLabel>
                <div className="relative">
                  <AreaChart className="absolute top-2 left-2.5 h-4 w-4 text-gray-400" />
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      className="h-8 w-full bg-white pr-3 pl-8 text-sm"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      onFocus={(e) => e.target.value === "0" && (e.target.value = "")}
                      onBlur={(e) => e.target.value === "" && field.onChange(0)}
                    />
                  </FormControl>
                </div>
                <FormMessage className="text-sm" />
              </FormItem>
            )}
          />

          <div className="flex h-full flex-col items-end justify-end">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="mr-1 mb-1 h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-700"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
