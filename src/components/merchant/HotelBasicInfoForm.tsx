import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { Calendar as CalendarIcon, UploadCloud, X, Hotel } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Dropzone, DropZoneArea, DropzoneTrigger, useDropzone } from "@/components/ui/dropzone";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useFormContext } from "react-hook-form";
import { HotelFormValues } from "@/schema/hotel";
import { AddressMapSelector } from "./AddressMapSelector";

const PREDEFINED_TAGS = ["亲子", "豪华", "商务", "度假", "温泉", "海景"];

export function HotelBasicInfoForm() {
  const form = useFormContext<HotelFormValues>();

  const currentTags = form.watch("tags") || [];
  const coverImage = form.watch("cover_image");
  const detailImages = form.watch("detail_images") || [];

  const removeTag = (tag: string) => {
    form.setValue(
      "tags",
      currentTags.filter((t) => t !== tag),
      { shouldValidate: true },
    );
  };

  const coverDropzone = useDropzone({
    onDropFile: async (file) => {
      const url = URL.createObjectURL(file);
      form.setValue("cover_image", url, { shouldValidate: true });
      return { status: "success", result: url };
    },
    validation: {
      accept: { "image/*": [] },
      maxFiles: 1,
    },
  });

  const detailDropzone = useDropzone({
    onDropFile: async (file) => {
      const url = URL.createObjectURL(file);
      return { status: "success", result: url };
    },
    onFileUploaded: (url: string) => {
      form.setValue("detail_images", [...(form.getValues("detail_images") || []), url], {
        shouldValidate: true,
      });
    },
    validation: {
      accept: { "image/*": [] },
    },
  });

  const removeDetailImage = (indexToRemove: number) => {
    const newImages = detailImages.filter((_, i) => i !== indexToRemove);
    form.setValue("detail_images", newImages, { shouldValidate: true });
  };

  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-gray-900">
        <Hotel className="h-5 w-5 text-gray-700" />
        酒店基础信息
      </h2>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {/* 左侧：基础表单 */}
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel required className="text-gray-700">
                  酒店名称 (中)
                </FormLabel>
                <FormControl>
                  <Input placeholder="请输入酒店中文名称" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="english_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel required className="text-gray-700">
                  酒店名称 (英)
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Please enter English name"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem className="col-span-1 md:col-span-2 lg:col-span-3">
                <FormLabel required className="text-gray-700">
                  地址与定位
                </FormLabel>
                <FormControl>
                  <AddressMapSelector
                    value={field.value}
                    longitude={form.watch("longitude")}
                    latitude={form.watch("latitude")}
                    onChange={(addr, loc) => {
                      field.onChange(addr);
                      if (loc) {
                        form.setValue("longitude", loc.lng.toString(), { shouldValidate: true });
                        form.setValue("latitude", loc.lat.toString(), { shouldValidate: true });
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-start gap-4">
            <div className="w-32">
              <FormField
                control={form.control}
                name="star"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel required className="text-gray-700">
                      酒店星级
                    </FormLabel>
                    <Select
                      value={field.value?.toString()}
                      onValueChange={(val: string) => field.onChange(Number(val))}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="请选择星级" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="5">五星级</SelectItem>
                        <SelectItem value="4">四星级</SelectItem>
                        <SelectItem value="3">三星级</SelectItem>
                        <SelectItem value="2">二星级</SelectItem>
                        <SelectItem value="1">一星级</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex-1">
              <FormField
                control={form.control}
                name="open_date"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel required className="text-gray-700">
                      开业时间
                    </FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "mt-0 w-full justify-start text-left font-normal",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? (
                              format(new Date(field.value), "PPP", { locale: zhCN })
                            ) : (
                              <span>选择日期</span>
                            )}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          locale={zhCN}
                          selected={field.value ? new Date(field.value) : undefined}
                          onSelect={(date) => {
                            if (date) {
                              field.onChange(format(date, "yyyy-MM-dd"));
                            } else {
                              field.onChange("");
                            }
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        {/* 中间：标签及简介 */}
        <div className="flex flex-col space-y-4">
          <FormField
            control={form.control}
            name="tags"
            render={() => (
              <FormItem>
                <FormLabel>标签</FormLabel>
                <FormControl>
                  <div className="grid grid-cols-3 gap-3 pt-1 pb-1">
                    {PREDEFINED_TAGS.map((tag) => {
                      const isSelected = currentTags.includes(tag);
                      return (
                        <Badge
                          key={tag}
                          variant={isSelected ? "default" : "outline"}
                          className={cn(
                            "flex w-full cursor-pointer items-center justify-center px-4 py-2 text-sm font-normal transition-all hover:opacity-80 active:scale-95",
                            isSelected
                              ? "bg-primary text-primary-foreground hover:bg-primary/90 font-medium shadow-sm"
                              : "border-gray-200 bg-white text-gray-600 hover:bg-gray-100",
                          )}
                          onClick={() => {
                            if (isSelected) {
                              removeTag(tag);
                            } else {
                              form.setValue("tags", [...currentTags, tag], {
                                shouldValidate: true,
                              });
                            }
                          }}
                        >
                          {tag}
                        </Badge>
                      );
                    })}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="flex min-h-0 flex-1 flex-col">
                <FormLabel>酒店简介</FormLabel>
                <FormControl className="min-h-0 flex-1">
                  <Textarea
                    className="h-full min-h-[160px] resize-none overflow-y-auto"
                    placeholder="请输入酒店简介，突出亮点与特色"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* 右侧：图片上传区 */}
        <div className="space-y-6">
          <FormField
            control={form.control}
            name="cover_image"
            render={() => (
              <FormItem>
                <FormLabel required className="text-gray-700">
                  封面图
                </FormLabel>
                <FormControl>
                  <div>
                    {coverImage ? (
                      <div className="group relative h-32 w-full overflow-hidden rounded-md border-2 border-dashed transition-colors">
                        <img src={coverImage} alt="cover" className="h-full w-full object-cover" />
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() =>
                              form.setValue("cover_image", "", {
                                shouldValidate: true,
                              })
                            }
                          >
                            重新上传
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Dropzone {...coverDropzone}>
                        <DropZoneArea className="relative flex h-32 w-full flex-col gap-2 transition-colors hover:bg-gray-50">
                          <DropzoneTrigger
                            className="absolute inset-0 z-10 m-0! h-full w-full cursor-pointer rounded-none border-none bg-transparent p-0! opacity-0 hover:bg-transparent"
                            aria-label="点击上传封面"
                          />
                          <UploadCloud className="pointer-events-none h-6 w-6 text-gray-400" />
                          <span className="pointer-events-none text-sm font-medium text-gray-700 transition-colors group-hover:text-gray-900">
                            点击上传封面
                          </span>
                        </DropZoneArea>
                      </Dropzone>
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="detail_images"
            render={() => (
              <FormItem>
                <FormLabel>详情页轮播图</FormLabel>
                <FormControl>
                  <div className="flex flex-wrap gap-4">
                    {detailImages.map((url, index) => (
                      <div
                        key={index}
                        className="group relative h-24 w-24 overflow-hidden rounded-md border shadow-sm"
                      >
                        <img
                          src={url}
                          alt={`detail-${index}`}
                          className="h-full w-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeDetailImage(index)}
                          className="absolute top-1 right-1 rounded-full bg-black/50 p-1 text-white opacity-0 transition-all group-hover:opacity-100 hover:bg-red-500 focus:outline-none"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    <Dropzone {...detailDropzone}>
                      <DropZoneArea className="relative flex h-24 w-24 flex-col items-center justify-center transition-colors hover:bg-gray-50">
                        <DropzoneTrigger
                          className="absolute inset-0 z-10 m-0! h-full w-full cursor-pointer rounded-none border-none bg-transparent p-0! opacity-0 hover:bg-transparent"
                          aria-label="增加图片"
                        />
                        <UploadCloud className="pointer-events-none mb-1 h-5 w-5 text-gray-400" />
                        <span className="pointer-events-none text-center text-[10px] font-medium text-gray-700 transition-colors group-hover:text-gray-900">
                          增加图片
                        </span>
                      </DropZoneArea>
                    </Dropzone>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
}
