import service from "../utils/request";

export type HotelStatus = "pending" | "published" | "rejected" | "offline";

export type Room = {
  id: number;
  name: string;
  area: number; //单位m²
  bed_info: string; //示例：2张1.2米单人床
  price: number;
  stock: number; //库存数量
  image: string;
};

export type Hotel = {
  id: number;
  owner_id: number; // ⚠️ 关键字段：关联到商家的 users.id
  name: string; //中文名
  english_name: string; //英文名
  address: string;
  city: string;
  star: number; // 1-5
  price: number; // decimal(10,2)  这里取各个房型中价格的最低价格
  status: "published" | "pending" | "offline" | "rejected"; // published=已发布, pending=审核中,offline=已下线，rejected=被驳回
  owner_name?: string;
  score: number;
  description: string;
  cover_image: string;
  detail_images: string[];
  open_date: string;
  tags: string[];
  rooms: Room[];
  reject_reason?: string;
};

export type HotelsResponse = {
  success: boolean;
  data: Hotel[];
  msg?: string;
};

export type AuditBody = {
  hotel_id: number;
  status: HotelStatus;
  reject_reason?: string;
};

export type AuditResponse = {
  success: boolean;
  msg?: string;
};

export type HotelFilterBody = {
  name?: string;
  status?: HotelStatus;
  owner_name?: string;
  city?: string;
  page?: number;
  page_size?: number;
};

export const getHotels = (body?: HotelFilterBody): Promise<HotelsResponse> => {
  return service.post("/api/admin/hotels", body ?? {});
};

export const auditHotel = (body: AuditBody): Promise<AuditResponse> => {
  return service.post("/api/admin/audit", body);
};
