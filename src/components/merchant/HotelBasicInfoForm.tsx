import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { Calendar as CalendarIcon, UploadCloud, X, Hotel } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useState, KeyboardEvent } from "react";
import {
  Dropzone,
  DropZoneArea,
  DropzoneTrigger,
  useDropzone,
} from "@/components/ui/dropzone";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useFormContext } from "react-hook-form";
import { HotelFormValues } from "@/schema/hotel";

export function HotelBasicInfoForm() {
  const form = useFormContext<HotelFormValues>();
  const [tagInput, setTagInput] = useState("");

  const currentTags = form.watch("tags") || [];
  const coverImage = form.watch("cover_image");
  const detailImages = form.watch("detail_images") || [];

  const handleAddTag = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim() !== "") {
      e.preventDefault();
      if (!currentTags.includes(tagInput.trim())) {
        form.setValue("tags", [...currentTags, tagInput.trim()], {
          shouldValidate: true,
        });
      }
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    form.setValue(
      "tags",
      currentTags.filter((t) => t !== tag),
      { shouldValidate: true }
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
      form.setValue(
        "detail_images",
        [...(form.getValues("detail_images") || []), url],
        { shouldValidate: true }
      );
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
    <div className="rounded-lg border bg-white shadow-sm p-6">
      <h2 className="text-xl font-bold mb-6 text-gray-900 flex items-center gap-2">
        <Hotel className="h-5 w-5 text-blue-600" />
        酒店基础信息
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                <FormLabel required className="text-gray-700">酒店名称 (英)</FormLabel>
                <FormControl>
                  <Input placeholder="Please enter English name" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel required className="text-gray-700">
                  地址
                </FormLabel>
                <FormControl>
                  <Input placeholder="请输入详细地址" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex gap-4 items-start">
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
                            "w-full justify-start text-left font-normal mt-0",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? (
                            format(new Date(field.value), "PPP")
                          ) : (
                            <span>选择日期</span>
                          )}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
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
        <div className="space-y-4 flex flex-col">
          <FormField
            control={form.control}
            name="tags"
            render={() => (
              <FormItem>
                <FormLabel>标签</FormLabel>
                <FormControl>
                  <div className="flex flex-wrap items-center gap-2 min-h-10 p-2 border rounded-md bg-white focus-within:ring-1 focus-within:ring-ring focus-within:border-primary transition-all">
                    {currentTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="flex items-center gap-1 py-1 px-2 text-sm font-normal text-gray-600 bg-gray-100 hover:bg-gray-200 border-none"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 rounded-full outline-none hover:text-red-500 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                    <input
                      className="flex-1 bg-transparent border-none outline-none text-sm min-w-[80px] p-1 placeholder:text-gray-400"
                      placeholder={
                        currentTags.length ? "添加新标签..." : "输入标签，按回车添加"
                      }
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleAddTag}
                    />
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
              <FormItem className="flex-1 flex flex-col min-h-0">
                <FormLabel>酒店简介</FormLabel>
                <FormControl className="flex-1 min-h-0">
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
                      <div className="w-full h-32 border-2 border-dashed rounded-md overflow-hidden relative group transition-colors">
                        <img
                          src={coverImage}
                          alt="cover"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity">
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
                        <DropZoneArea className="w-full h-32 flex flex-col gap-2">
                          <UploadCloud className="h-6 w-6 text-gray-400" />
                          <DropzoneTrigger className="bg-transparent px-0 py-0 text-sm font-normal text-blue-600 hover:bg-transparent">
                            点击上传封面
                          </DropzoneTrigger>
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
                        className="w-24 h-24 border rounded-md overflow-hidden relative group shadow-sm"
                      >
                        <img
                          src={url}
                          alt={`detail-${index}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeDetailImage(index)}
                          className="absolute top-1 right-1 bg-black/50 hover:bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all focus:outline-none"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    <Dropzone {...detailDropzone}>
                      <DropZoneArea className="w-24 h-24 flex flex-col items-center justify-center">
                        <UploadCloud className="h-5 w-5 mb-1 text-gray-400" />
                        <DropzoneTrigger className="bg-transparent px-0 py-0 text-[10px] font-normal text-blue-600 hover:bg-transparent text-center">
                          增加图片
                        </DropzoneTrigger>
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
