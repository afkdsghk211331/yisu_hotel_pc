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
                onClick={() => form.setValue(imageField, "", { shouldValidate: true })}
              >
                重新上传
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
                <div className="focus-within:ring-ring flex h-8 items-center justify-center rounded-md border bg-white px-2 transition-shadow focus-within:ring-1">
                  <Input
                    placeholder="请输入房型名称"
                    className="h-7 w-full border-none bg-transparent px-1 text-sm shadow-none focus-visible:ring-0"
                    {...field}
                  />
                </div>
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
              <FormControl>
                <div className="focus-within:ring-ring flex h-8 items-center justify-center rounded-md border bg-white px-2 transition-shadow focus-within:ring-1">
                  <BedDouble className="h-4 w-4 shrink-0 text-gray-400" />
                  <Input
                    placeholder="例如: 1张2米特大床"
                    className="h-7 w-full border-none bg-transparent px-1 text-sm text-gray-900 shadow-none focus-visible:ring-0"
                    {...field}
                  />
                </div>
              </FormControl>
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
                <FormControl>
                  <div className="flex h-8 items-center justify-center rounded-md border bg-white px-2 text-sm transition-shadow focus-within:ring-1">
                    <Grid2x2 className="h-4 w-4 shrink-0 text-gray-400" />
                    <Input
                      type="number"
                      min={0}
                      className="h-7 w-full border-none bg-transparent px-1 text-center shadow-none focus-visible:ring-0"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      onFocus={(e) => e.target.value === "0" && (e.target.value = "")}
                      onBlur={(e) => e.target.value === "" && field.onChange(0)}
                    />
                  </div>
                </FormControl>
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
                <FormControl>
                  <div className="flex h-8 items-center justify-center rounded-md border bg-white px-2 text-sm transition-shadow focus-within:ring-1">
                    <CircleDollarSign className="h-4 w-4 shrink-0 text-gray-400" />

                    <Input
                      type="number"
                      min={0}
                      className="h-7 w-full border-none bg-transparent px-1 text-center shadow-none focus-visible:ring-0"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      onFocus={(e) => e.target.value === "0" && (e.target.value = "")}
                      onBlur={(e) => e.target.value === "" && field.onChange(0)}
                    />
                  </div>
                </FormControl>
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
                <FormControl>
                  <div className="flex h-8 items-center justify-center rounded-md border bg-white px-2 text-sm transition-shadow focus-within:ring-1">
                    <AreaChart className="h-4 w-4 shrink-0 text-gray-400" />
                    <Input
                      type="number"
                      min={0}
                      className="h-7 w-full border-none bg-transparent px-1 text-center shadow-none focus-visible:ring-0"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      onFocus={(e) => e.target.value === "0" && (e.target.value = "")}
                      onBlur={(e) => e.target.value === "" && field.onChange(0)}
                    />
                  </div>
                </FormControl>
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
