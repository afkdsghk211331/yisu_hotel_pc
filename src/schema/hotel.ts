import { z } from "zod";

export const roomSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, { message: "请输入房型名称" }),
  price: z.coerce.number().min(0, { message: "价格不能小于0" }),
  stock: z.coerce.number().min(0, { message: "库存不能小于0" }),
  area: z.coerce.number().min(1, { message: "面积不能小于1" }),
  bed_info: z.string().min(1, { message: "请输入床型信息" }),
  image: z.string().optional(),
});

export const hotelSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, { message: "请输入酒店中文名称" }),
  english_name: z.string().optional(),
  address: z.string().min(1, { message: "请输入详细地址" }),
  longitude: z.string().optional(),
  latitude: z.string().optional(),
  star: z.coerce.number().min(1).max(5).default(5),
  open_date: z.string().min(1, { message: "请选择开业时间" }),
  cover_image: z.string().min(1, { message: "请上传封面图" }),
  detail_images: z.array(z.string()).optional().default([]),
  tags: z.array(z.string()).optional().default([]),
  description: z.string().optional(),
  rooms: z.array(roomSchema).optional().default([]),
});

export type HotelFormValues = z.infer<typeof hotelSchema>;
export type RoomFormValues = z.infer<typeof roomSchema>;
