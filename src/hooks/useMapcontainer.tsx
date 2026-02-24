import { useEffect } from "react";
import AMapLoader from "@amap/amap-jsapi-loader";

declare global {
  interface Window {
    _AMapSecurityConfig: {
      securityJsCode?: string;
    };
  }
}

export default function useMapContainer() {
  useEffect(() => {
    window._AMapSecurityConfig = {
      securityJsCode: "c412d58a54c3d1f42bd4553cfd372b76",
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let map: any = null;

    AMapLoader.load({
      key: "378b8800b01fe2960b45d97d1f360be7", // 申请好的Web端开发者Key，首次调用 load 时必填
      version: "2.0", // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
      plugins: ["AMap.Scale"], //需要使用的的插件列表，如比例尺'AMap.Scale'，支持添加多个如：['...','...']
    })
      .then((AMap) => {
        map = new AMap.Map("container", {
          viewMode: "3D", // 使用3D视图
          zoom: 11, // 初始化地图级别
          center: [116.397428, 39.90923], // 初始化地图中心点位置
        });
      })
      .catch((e) => {
        console.log(e);
      });

    return () => {
      map?.destroy();
    };
  }, []);
}
