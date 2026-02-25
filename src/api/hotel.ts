import service from "../utils/request";
import { useUserStore } from "../store/userStore";

// 从 store 中安全地读取当前用户的 role 和 userId
function getUserParams() {
  const { userInfo } = useUserStore.getState();
  return {
    role: userInfo?.role ?? "",
    userId: userInfo?.id ?? "",
  };
}

export type HotelStatus = "pending" | "published" | "rejected" | "offline";

export type Room = {
  id?: number;
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
  longitude?: string;
  latitude?: string;
  city: string;
  star: number; // 1-5
  price: number; // decimal(10,2)  这里取各个房型中价格的最低价格
  status: "published" | "pending" | "offline" | "rejected"; // published=已发布, pending=审核中,offline=已下线，rejected=被驳回
  owner_name?: string;
  score: number;
  description: string;
  cover_image: string;
  detail_images: string[] | string;
  open_date: string;
  tags: string[] | string;
  facilities?: string[] | string;
  rooms?: Room[];
  reject_reason?: string;
};

export interface MerchantHotelservice {
  owner_id?: number;
  name: string;
  english_name: string;
  address: string;
  city?: string;
  longitude?: string;
  latitude?: string;
  star: number;
  description?: string;
  cover_image: string;
  detail_images?: string[];
  open_date: string;
  tags?: string[];
  facilities?: string[];
  rooms?: Room[];
}

// ==========================================
// 2. 接口响应定义区
// ==========================================

export type HotelsResponse = {
  success: boolean;
  data: Hotel[];
  msg?: string;
};

export type AuditStatus = 1 | 2; // 1=通过, 2=不通过

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

export type HotelListFilter = {
  hotelName?: string;
  merchantName?: string;
  status?: string;
  city?: string;
};

export const getHotels = (filter: HotelListFilter = {}): Promise<HotelsResponse> => {
  const params = {
    ...getUserParams(),
    ...(filter.hotelName ? { hotelName: filter.hotelName } : {}),
    ...(filter.merchantName ? { merchantName: filter.merchantName } : {}),
    ...(filter.status ? { status: filter.status } : {}),
    ...(filter.city ? { city: filter.city } : {}),
  };
  return service.get("/api/admin/hotels/pending", { params });
};

export const auditHotel = (hotelId: number, status: AuditStatus): Promise<AuditResponse> => {
  return service.put(`/api/admin/hotels/${hotelId}/audit`, { status });
};

export interface MerchantHotelListResponse {
  success: boolean;
  msg: string;
  data: Hotel[];
}

export interface MerchantHotelDetailResponse {
  success: boolean;
  msg: string;
  data: Hotel;
}

export const getMerchantHotels = (): Promise<MerchantHotelListResponse> => {
  return service.get("/api/merchant/hotels", { params: getUserParams() });
};

// 获取单个酒店详情（商家）
export const getMerchantHotelDetail = (id: number): Promise<MerchantHotelDetailResponse> => {
  return service.get(`/api/merchant/hotels/${id}`);
};

// 管理员查看酒店完整详情（含房型）
export const getAdminHotelDetail = (id: number): Promise<MerchantHotelDetailResponse> => {
  return service.get(`/api/merchant/hotels/${id}`);
};

// 新增酒店
export const createMerchantHotel = (
  data: MerchantHotelservice,
): Promise<MerchantHotelDetailResponse> => {
  return service.post("/api/merchant/hotels", data);
};

// 更新酒店
export const updateMerchantHotel = (
  id: number,
  data: MerchantHotelservice,
): Promise<MerchantHotelDetailResponse> => {
  return service.put(`/api/merchant/hotels/${id}`, data);
};

// 删除酒店
export const deleteMerchantHotel = (id: number): Promise<{ success: boolean; msg: string }> => {
  return service.delete(`/api/merchant/hotels/${id}`);
};
