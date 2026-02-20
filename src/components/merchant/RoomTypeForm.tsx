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
import {
  Dropzone,
  DropZoneArea,
  DropzoneTrigger,
  useDropzone,
} from "@/components/ui/dropzone";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

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

  return (
    <div className="rounded-lg border bg-white shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900">
          <CheckCircle2 className="h-5 w-5 text-blue-600" />
          房型配置
        </h2>
        <Button
          type="button"
          onClick={handleAddRoom}
          className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
        >
          <Plus className="h-4 w-4" />
          新增房型
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {fields.map((field, index) => (
          <RoomCard
            key={field.id}
            index={index}
            onDelete={() => remove(index)}
          />
        ))}
      </div>
    </div>
  );
}

function RoomCard({ index, onDelete }: { index: number; onDelete: () => void }) {
  const form = useFormContext<HotelFormValues>();

  const imageField = `rooms.${index}.image` as const;
  const currentImage = form.watch(`rooms.${index}.image`);

  const imageDropzone = useDropzone({
    onDropFile: async (file) => {
      const url = URL.createObjectURL(file);
      form.setValue(imageField, url, { shouldValidate: true });
      return { status: "success", result: url };
    },
    validation: {
      accept: { "image/*": [] },
      maxFiles: 1,
    },
  });

  return (
    <div className="border rounded-lg overflow-hidden bg-gray-50 flex flex-col hover:shadow-md transition-shadow">
      <div className="h-40 bg-gray-200 relative group">
        {currentImage ? (
          <>
            <img
              src={currentImage}
              alt="room cover"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() =>
                  form.setValue(imageField, "", { shouldValidate: true })
                }
              >
                重新上传
              </Button>
            </div>
          </>
        ) : (
          <Dropzone {...imageDropzone}>
            <DropZoneArea className="w-full h-full border-none bg-gray-50 flex flex-col items-center justify-center rounded-none hover:bg-gray-100 transition-colors">
              <UploadCloud className="h-6 w-6 text-gray-400 mb-2" />
              <DropzoneTrigger className="bg-transparent px-0 py-0 text-xs font-normal text-blue-600 hover:bg-transparent">
                点击上传房型图片
              </DropzoneTrigger>
            </DropZoneArea>
          </Dropzone>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1 space-y-3">
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
                <div className="flex items-center justify-center bg-white border rounded-md px-2 focus-within:ring-1 focus-within:ring-ring transition-shadow h-8">
                  <Input
                    placeholder="请输入房型名称"
                    className="h-7 w-full text-sm border-none shadow-none focus-visible:ring-0 px-1"
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage className="text-[10px]" />
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
              <FormControl>
                <div className="flex items-center justify-center bg-white border rounded-md px-2 focus-within:ring-1 focus-within:ring-ring transition-shadow h-8">
                  <BedDouble className="h-4 w-4 text-gray-400 shrink-0" />
                  <Input
                    placeholder="例如: 1张2米特大床"
                    className="h-7 w-full text-sm border-none shadow-none focus-visible:ring-0 px-1 text-gray-900"
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage className="text-[10px]" />
            </FormItem>
          )}
        />

        {/* Number, Price, Area Grid */}
        <div className="grid grid-cols-2 gap-3 flex-1 items-start mt-1">
          <FormField
            control={form.control}
            name={`rooms.${index}.stock`}
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel required className="text-sm text-gray-500">
                  数量
                </FormLabel>
                <FormControl>
                  <div className="flex items-center justify-center bg-white border rounded-md px-2 focus-within:ring-1 transition-shadow h-8 text-sm">
                    <Grid2x2 className="h-4 w-4 text-gray-400 shrink-0" />
                    <Input
                      type="number"
                      min={0}
                      className="h-7 w-full text-center border-none shadow-none focus-visible:ring-0 px-1"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-[10px]" />
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
                <FormControl>
                  <div className="flex items-center justify-center bg-white border rounded-md px-2 focus-within:ring-1 transition-shadow h-8 text-sm">
                    <CircleDollarSign className="h-4 w-4 text-gray-400 shrink-0" />
                    
                    <Input
                      type="number"
                      min={0}
                      className="h-7 w-full text-center border-none shadow-none focus-visible:ring-0 px-1"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-[10px]" />
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
                <FormControl>
                  <div className="flex items-center justify-center bg-white border rounded-md px-2 focus-within:ring-1 transition-shadow h-8 text-sm">
                    <AreaChart className="h-4 w-4 text-gray-400 shrink-0" />
                    <Input
                      type="number"
                      min={0}
                      className="h-7 w-full text-center border-none shadow-none focus-visible:ring-0 px-1"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-[10px]" />
              </FormItem>
            )}
          />

          <div className="flex flex-col justify-end items-end h-full">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 mb-1 mr-1"
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
