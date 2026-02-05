import axios from "axios";

const amapBaseURL = "https://restapi.amap.com/v3";
const key = "3472349111046e399b927a89750ba335"; // 高德地图 Key

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

const getLocationByIP = (ip?: string): Promise<AMapResponse<IPResult>> => {
  return amapService.get(`${amapBaseURL}/ip`, {
    params: { key, ip },
  });
};

export { getLocationByIP };
