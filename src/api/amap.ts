import axios from "axios";

const amapBaseURL = "https://restapi.amap.com/v3";
const key = "be24a0ff97c37c0fa78d5a3c0c04b35c"; // 高德地图 Key

const amapService = axios.create({ baseURL: amapBaseURL, timeout: 5000 });

type AMapResponse<T> = {
  status: string;
  info: string;
  infocode: string;
  data: T;
};

export type IPResult = {
  status: string;
  info: string;
  infocode: string;
  province: string;
  city: string;
  adcode: string;
  rectangle: string;
};

export type InputTipResult = {
  id: string;
  name: string;
  district: string;
  location: string;
  address: string;
};

const getLocationByIP = (ip?: string): Promise<AMapResponse<IPResult>> => {
  return amapService.get(`${amapBaseURL}/ip`, {
    params: { key, ip },
  });
};

const getInputTips = (keywords: string, city?: string): Promise<AMapResponse<{ count: string; infocode: string; info: string; status: string; tips: InputTipResult[] }>> => {
  return amapService.get(`${amapBaseURL}/assistant/inputtips`, {
    params: { key, keywords, city, datatype: "poi" },
  });
};

export { getLocationByIP, getInputTips };
