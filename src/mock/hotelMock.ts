import { MerchantHotelResponse } from "@/api/hotel";
import MockAdapter from "axios-mock-adapter";
import request from "@/utils/request";

// ==========================================
// 1. 本地 Mock 数据定义区
// ==========================================

export const mockHotels: MerchantHotelResponse[] = [
  {
    id: 1,
    owner_id: 101,
    name: "上海陆家嘴禧玥酒店",
    english_name: "Shanghai Lujiazui Xiyue Hotel",
    address: "上海市浦东新区浦东大道1118号",
    star: 5,
    price: 936,
    status: "rejected",
    score: 4.8,
    description: "",
    cover_image:
      "https://images.unsplash.com/photo-1542314831-c6a4d27ce66f?auto=format&fit=crop&q=80",
    detail_images: [],
    tags: [],
    open_date: "2020-01-01",
    rooms: [
      {
        id: 1,
        name: "标准双床房",
        area: 40,
        bed_info: "2张1.2米单人床",
        price: 936,
        stock: 10,
        image:
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&q=80",
      },
      {
        id: 2,
        name: "豪华大床房",
        area: 50,
        bed_info: "1张2米特大床",
        price: 1200,
        stock: 5,
        image:
          "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80",
      },
    ],
    reject_reason: "图片不清晰或不合规",
  },
  {
    id: 2,
    owner_id: 101,
    name: "广州四季酒店",
    english_name: "Four Seasons Hotel Guangzhou",
    address: "广东省广州市天河区珠江新城珠江西路5号",
    star: 5,
    price: 2388,
    status: "pending",
    score: 4.9,
    description: "",
    cover_image:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80",
    detail_images: [],
    tags: [],
    open_date: "2018-05-01",
    rooms: [],
  },
  {
    id: 3,
    owner_id: 101,
    name: "西安索菲特传奇人民大厦酒店",
    english_name: "Sofitel Legend Peoples Grand Hotel Xian",
    address: "陕西省西安市新城区东新街319号",
    star: 5,
    price: 2188,
    status: "pending",
    score: 4.8,
    description: "",
    cover_image:
      "https://images.unsplash.com/photo-1551882547-ff40c0d5b5df?auto=format&fit=crop&q=80",
    detail_images: [],
    tags: [],
    open_date: "2021-02-01",
    rooms: [],
  },
  {
    id: 4,
    owner_id: 101,
    name: "三亚亚特兰蒂斯酒店",
    english_name: "Atlantis Sanya",
    address: "海南省三亚市海棠区海棠北路36号",
    star: 5,
    price: 2888,
    status: "published",
    score: 4.9,
    description: "",
    cover_image:
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80",
    detail_images: [],
    tags: [],
    open_date: "2019-10-01",
    rooms: [],
  },
  {
    id: 5,
    owner_id: 101,
    name: "北京颐和安缦酒店",
    english_name: "Aman Summer Palace Beijing",
    address: "北京市海淀区颐和园15号",
    star: 5,
    price: 5888,
    status: "published",
    score: 5.0,
    description: "坐落于颐和园东门，这里的套房和客房散落在充满历史底蕴的庭院中。",
    cover_image:
      "https://images.unsplash.com/photo-1549294413-26f195200c16?auto=format&fit=crop&q=80",
    detail_images: [
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&q=80",
    ],
    tags: ["园林酒店", "文化遗产", "极致奢华"],
    open_date: "2008-09-01",
    rooms: [
      {
        id: 5,
        name: "庭院套房",
        area: 60,
        bed_info: "1张2米特大床",
        price: 5888,
        stock: 3,
        image:
          "https://images.unsplash.com/photo-1582719478237-7504629471f4?auto=format&fit=crop&q=80",
      },
    ],
  },
];

// ==========================================
// 2. 网络请求拦截区 (Axios Mock Adapter)
// ==========================================

// 初始化 mock 实例，延迟 500ms 模拟真实网络
const mock = new MockAdapter(request, { delayResponse: 500 });

// 拦截 GET 请求：获取酒店列表
mock.onGet("/api/merchant/hotels").reply(200, {
  success: true,
  msg: "请求成功",
  data: mockHotels,
});

// 拦截 GET 请求：获取单个酒店详情
mock.onGet(/\/api\/merchant\/hotels\/\d+/).reply((config) => {
  const match = config.url?.match(/\/api\/merchant\/hotels\/(\d+)/);
  const id = match ? Number(match[1]) : 0;
  const hotel = mockHotels.find((h) => h.id === id);
  if (hotel) {
    return [200, { success: true, msg: "ok", data: hotel }];
  }
  return [404, { success: false, msg: "未找到对应酒店" }];
});

// 拦截 POST 请求：新建酒店
mock.onPost("/api/merchant/hotels").reply((config) => {
  try {
    const newHotel = JSON.parse(config.data);
    const createdHotel: MerchantHotelResponse = {
      id: Date.now(),
      owner_id: 1, // 当前商户默认ID
      status: "pending",
      score: 5.0,
      ...newHotel,
    };
    mockHotels.unshift(createdHotel); // 插入到前面
    return [200, { success: true, msg: "创建成功", data: createdHotel }];
  } catch {
    return [400, { success: false, msg: "请求数据格式错误" }];
  }
});

// 拦截 PUT 请求：更新酒店
mock.onPut(/\/api\/merchant\/hotels\/\d+/).reply((config) => {
  try {
    const match = config.url?.match(/\/api\/merchant\/hotels\/(\d+)/);
    const id = match ? Number(match[1]) : 0;
    const index = mockHotels.findIndex((h) => h.id === id);
    if (index !== -1) {
      const updateData = JSON.parse(config.data);
      mockHotels[index] = { ...mockHotels[index], ...updateData };
      return [200, { success: true, msg: "更新成功", data: mockHotels[index] }];
    }
    return [404, { success: false, msg: "未找到对应酒店" }];
  } catch {
    return [400, { success: false, msg: "请求数据格式错误" }];
  }
});

// 拦截 DELETE 请求：删除酒店
mock.onDelete(/\/api\/merchant\/hotels\/\d+/).reply((config) => {
  const match = config.url?.match(/\/api\/merchant\/hotels\/(\d+)/);
  const id = match ? Number(match[1]) : 0;
  const index = mockHotels.findIndex((h) => h.id === id);
  if (index !== -1) {
    mockHotels.splice(index, 1);
    return [200, { success: true, msg: "删除成功" }];
  }
  return [404, { success: false, msg: "未找到对应酒店" }];
});
