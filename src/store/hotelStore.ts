import { create } from 'zustand';
import { 
  getMerchantHotels, 
  getMerchantHotelDetail, 
  deleteMerchantHotel,
  MerchantHotelResponse,
  MerchantRoomRequest
} from '@/api/hotel';

interface HotelState {
  hotelList: MerchantHotelResponse[];
  currentHotel: MerchantHotelResponse | null;
  isLoading: boolean;
  error: string | null;
  fetchHotelList: () => Promise<void>;
  fetchHotelDetail: (id: number) => Promise<void>;
  clearCurrentHotel: () => void;
  deleteHotel: (id: number) => Promise<void>;
  addRoomType: (room: Omit<MerchantRoomRequest, 'id'>) => Promise<void>;
  updateRoomType: (roomId: number, roomData: Partial<MerchantRoomRequest>) => Promise<void>;
  deleteRoomType: (roomId: number) => Promise<void>;
}

export const useHotelStore = create<HotelState>((set) => ({
  hotelList: [],
  currentHotel: null,
  isLoading: false,
  error: null,

  // 获取酒店列表
  fetchHotelList: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await getMerchantHotels();
      if (response && response.success) {
        set({ hotelList: response.data, isLoading: false });
      } else {
        set({ error: response?.msg || '获取酒店列表失败', isLoading: false });
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        set({ error: error.message || '获取酒店列表出错', isLoading: false });
      } else {
        set({ error: '获取酒店列表出错', isLoading: false });
      }
    }
  },

  // 获取酒店详情
  fetchHotelDetail: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await getMerchantHotelDetail(id);
      if (response && response.success) {
        set({ currentHotel: response.data, isLoading: false });
      } else {
        set({ error: response?.msg || '酒店不存在', isLoading: false });
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        set({ error: error.message || '获取酒店详情失败', isLoading: false });
      } else {
        set({ error: '获取酒店详情失败', isLoading: false });
      }
    }
  },

  // 清除当前酒店缓存（用于新增状态）
  clearCurrentHotel: () => {
    set({ currentHotel: null, error: null });
  },

  // 删除酒店
  deleteHotel: async (id: number) => {
    try {
      set({ isLoading: true, error: null });
      const response = await deleteMerchantHotel(id);
      if (response && response.success) {
        set((state) => ({
          hotelList: state.hotelList.filter(h => h.id !== id),
          isLoading: false
        }));
      } else {
        set({ error: response?.msg || '删除失败', isLoading: false });
      }
    } catch (error: unknown) {
      console.error('删除酒店失败', error);
      if (error instanceof Error) {
        set({ error: error.message || '删除出错', isLoading: false });
      } else {
        set({ error: '删除出错', isLoading: false });
      }
    }
  },

  // 前端本地管理房型 (不立即发起请求)
  addRoomType: async (roomData: Omit<MerchantRoomRequest, 'id'>) => {
    try {
      set((state) => {
        if (!state.currentHotel) return state;
        const newRoom: MerchantRoomRequest = {
          ...roomData,
          id: Date.now(), // 临时ID
        };
        const currentRooms = state.currentHotel.rooms || [];
        return {
          currentHotel: {
            ...state.currentHotel,
            rooms: [...currentRooms, newRoom],
          },
        };
      });
    } catch (error) {
      console.error('新增房型失败', error);
    }
  },

  updateRoomType: async (roomId: number, roomData: Partial<MerchantRoomRequest>) => {
    try {
      set((state) => {
        if (!state.currentHotel) return state;
        const currentRooms = state.currentHotel.rooms || [];
        const updatedRooms = currentRooms.map((room) =>
          room.id === roomId ? { ...room, ...roomData } : room
        );
        return {
          currentHotel: {
            ...state.currentHotel,
            rooms: updatedRooms,
          },
        };
      });
    } catch (error) {
      console.error('更新房型失败', error);
    }
  },

  deleteRoomType: async (roomId: number) => {
    try {
      set((state) => {
        if (!state.currentHotel) return state;
        const currentRooms = state.currentHotel.rooms || [];
        const filteredRooms = currentRooms.filter((room) => room.id !== roomId);
        return {
          currentHotel: {
            ...state.currentHotel,
            rooms: filteredRooms,
          },
        };
      });
    } catch (error) {
      console.error('删除房型失败', error);
    }
  },
}));
