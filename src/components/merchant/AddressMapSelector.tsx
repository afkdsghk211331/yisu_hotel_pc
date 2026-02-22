import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MapPin, Loader2 } from "lucide-react";
import { getInputTips, InputTipResult } from "@/api/amap";
import { useDebounce } from "@/hooks/useDebounce";
import AMapLoader from "@amap/amap-jsapi-loader";

interface AddressMapSelectorProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "value"
> {
  value: string;
  longitude?: string;
  latitude?: string;
  onChange: (address: string, location?: { lng: number; lat: number }) => void;
}

// 定义高德地图相关的轻量型接口，避免使用 any 并符合 ESLint 规范
interface AMapMap {
  destroy(): void;
  getCenter(): { lng: number; lat: number };
  on(event: string, handler: () => void): void;
  addControl(control: unknown): void;
}

interface AMapGeocoder {
  getAddress(
    location: { lng: number; lat: number },
    callback: (status: string, result: AMapRegeocodeResult | string) => void,
  ): void;
}

interface AMapRegeocodeResult {
  info: string;
  regeocode: {
    formattedAddress: string;
  };
}

export const AddressMapSelector = React.forwardRef<HTMLInputElement, AddressMapSelectorProps>(
  ({ value, longitude, latitude, onChange, ...props }, ref) => {
    const [isMapOpen, setIsMapOpen] = useState(false);

    // 补全状态
    const [inputValue, setInputValue] = useState(value || "");
    const [tips, setTips] = useState<InputTipResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showTips, setShowTips] = useState(false);
    const debouncedSearchTerm = useDebounce(inputValue, 500);

    // 地图状态
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<AMapMap | null>(null);
    const geocoderRef = useRef<AMapGeocoder | null>(null);

    const [selectedLocation, setSelectedLocation] = useState<{ lng: number; lat: number } | null>(
      longitude && latitude ? { lng: Number(longitude), lat: Number(latitude) } : null,
    );
    const [selectedAddress, setSelectedAddress] = useState("");

    // 同步外部 props
    useEffect(() => {
      setInputValue(value || "");
    }, [value]);

    useEffect(() => {
      if (longitude && latitude) {
        setSelectedLocation({ lng: Number(longitude), lat: Number(latitude) });
      }
    }, [longitude, latitude]);

    useEffect(() => {
      if (debouncedSearchTerm && showTips && debouncedSearchTerm !== value) {
        searchTips(debouncedSearchTerm);
      } else {
        setTips([]);
        setIsSearching(false);
      }
    }, [debouncedSearchTerm, showTips, value]);

    const searchTips = async (keyword: string) => {
      setIsSearching(true);
      try {
        const res = await getInputTips(keyword);
        // axios 返回的结果在 res.data 中，amap api 返回的 status 是字符串 "1"
        const data = res.data;

        if (data.status === "1" && data.tips?.length > 0) {
          setTips(
            data.tips.filter(
              (item) => typeof item.location === "string" && item.location.length > 0,
            ),
          );
        } else {
          setTips([]);
        }
      } catch (e) {
        console.error("获取提示失败", e);
      } finally {
        setIsSearching(false);
      }
    };

    useEffect(() => {
      if (!isMapOpen) {
        if (mapRef.current) {
          mapRef.current.destroy();
          mapRef.current = null;
        }
        geocoderRef.current = null;
        return;
      }

      // 弹窗打开时，增加延迟确保 DOM 稳定
      const timer = setTimeout(() => {
        // 如果已经初始化过，直接返回避免重复加载
        if (mapRef.current) return;

        window._AMapSecurityConfig = {
          securityJsCode: "c412d58a54c3d1f42bd4553cfd372b76",
        };

        AMapLoader.load({
          key: "378b8800b01fe2960b45d97d1f360be7",
          version: "2.0",
          plugins: ["AMap.Scale", "AMap.Geocoder", "AMap.AutoComplete", "AMap.Geolocation"],
        })
          .then((AMapInstance) => {
            // 在这期间弹窗可能已经关了，二次确认
            if (!mapContainerRef.current || !isMapOpen) return;
            if (mapRef.current) return;

            AMapInstance.plugin(
              ["AMap.Scale", "AMap.Geocoder", "AMap.AutoComplete", "AMap.Geolocation"],
              () => {
                const map = new AMapInstance.Map(mapContainerRef.current, {
                  viewMode: "2D",
                  zoom: 15,
                  // 取当前的 selectedLocation 设置中心点（这只会作为初始化基准，后续拖拽不影响这个初始值）
                  center: selectedLocation
                    ? [selectedLocation.lng, selectedLocation.lat]
                    : [116.397428, 39.90923], // 默认北京
                });
                mapRef.current = map as unknown as AMapMap;

                const geocoder = new AMapInstance.Geocoder({
                  city: "全国",
                });
                geocoderRef.current = geocoder as unknown as AMapGeocoder;

                const parseCenterAddress = () => {
                  const center = map.getCenter();
                  if (geocoder) {
                    geocoder.getAddress(
                      center,
                      (status: string, result: AMapRegeocodeResult | string) => {
                        if (
                          status === "complete" &&
                          typeof result !== "string" &&
                          result.info === "OK"
                        ) {
                          const address = result.regeocode.formattedAddress;
                          setSelectedAddress(address);
                          setSelectedLocation({ lng: center.lng, lat: center.lat });
                        } else {
                          console.error("逆地理编码失败:", status, result);
                          setSelectedAddress("获取地址失败，请拖拽重试");
                        }
                      },
                    );
                  }
                };

                map.on("moveend", parseCenterAddress);

                // 如果没有初始选中坐标，尝试使用浏览器定位
                if (!selectedLocation) {
                  const geolocation = new AMapInstance.Geolocation({
                    enableHighAccuracy: true,
                    timeout: 5000,
                    maximumAge: 0,
                    convert: true,
                    showButton: true,
                    buttonPosition: "RB",
                    buttonOffset: new AMapInstance.Pixel(10, 20),
                    showMarker: false,
                    showCircle: false,
                    panToLocation: true,
                    zoomToAccuracy: true,
                  });

                  map.addControl(geolocation);

                  setSelectedAddress("正在获取你的位置...");

                  geolocation.getCurrentPosition((status: string, result: unknown) => {
                    if (status === "complete") {
                      // 定位成功后，地图会自动 panToLocation，触发 map 的 moveend 事件去重新解析地址
                      // 我们也可以在这里手动获取一下以免事件遗漏
                      const pos = (result as { position: { lng: number; lat: number } }).position;
                      setSelectedLocation({ lng: pos.lng, lat: pos.lat });
                      parseCenterAddress();
                    } else {
                      console.error("浏览器定位失败", result);
                      // 定位失败就用默认的北京回调拿地址
                      parseCenterAddress();
                    }
                  });
                } else {
                  parseCenterAddress(); // Initial parse of provided location
                }
              },
            );
          })
          .catch((e) => {
            console.error("AMap load error", e);
          });
      }, 400);

      return () => {
        if (timer) clearTimeout(timer);
      };
    }, [isMapOpen, selectedLocation]);

    const handleSelectTip = (tip: InputTipResult) => {
      try {
        const [lng, lat] = tip.location.split(",").map(Number);
        // 有的 tip.address 可能是数组或其他类型，我们尽可能拼接出详细文本
        const addressText =
          typeof tip.address === "string" && tip.address.length > 0
            ? `${tip.district}${tip.address}${tip.name}`
            : `${tip.district}${tip.name}`;

        setInputValue(addressText);
        setShowTips(false);
        onChange(addressText, { lng, lat });
      } catch (e) {
        console.error(e);
      }
    };

    const handleConfirmMapSelection = () => {
      if (selectedAddress && selectedLocation) {
        setInputValue(selectedAddress);
        onChange(selectedAddress, selectedLocation);
        setIsMapOpen(false);
      }
    };

    return (
      <div className="relative w-full">
        <div className="relative flex gap-2">
          <div className="relative flex-1">
            <Input
              {...props}
              ref={ref}
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                setShowTips(true);
              }}
              placeholder="请输入或搜索详细地址"
              className="pr-8 text-base sm:text-sm"
              onFocus={() => {
                if (inputValue) setShowTips(true);
              }}
              onBlur={() => {
                // 延迟关闭，以便点击下拉项能触发
                setTimeout(() => setShowTips(false), 200);
              }}
            />
            {isSearching && (
              <Loader2 className="absolute top-2.5 right-3 h-4 w-4 animate-spin text-gray-400" />
            )}
          </div>

          <Dialog open={isMapOpen} onOpenChange={setIsMapOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" type="button" className="shrink-0">
                <MapPin className="mr-2 h-4 w-4" />
                定位
              </Button>
            </DialogTrigger>
            <DialogContent className="flex h-[600px] max-h-[90vh] flex-col overflow-hidden p-4 sm:max-w-[600px] sm:p-6">
              <DialogHeader className="shrink-0">
                <DialogTitle>在地图上选择位置</DialogTitle>
                <DialogDescription>拖拽地图以精确定位酒店位置</DialogDescription>
              </DialogHeader>
              <div className="relative mt-4 min-h-0 flex-1 overflow-hidden rounded-md border bg-gray-100">
                <div ref={mapContainerRef} className="h-full w-full" />
                <div className="pointer-events-none absolute top-1/2 left-1/2 z-10 flex h-8 w-8 -translate-x-1/2 -translate-y-full items-end justify-center pb-1 drop-shadow-md">
                  <MapPin className="-mt-2 h-8 w-8 animate-bounce fill-white text-red-600" />
                </div>
              </div>

              <div className="mt-4 flex min-h-[60px] shrink-0 items-center rounded-md border border-gray-100 bg-gray-50 p-3 text-sm text-gray-700">
                {selectedAddress ? (
                  <>
                    <MapPin className="mr-2 h-5 w-5 shrink-0 text-blue-500" />
                    <span className="leading-relaxed">{selectedAddress}</span>
                  </>
                ) : (
                  <div className="flex items-center text-gray-500">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    正在获取当前位置...
                  </div>
                )}
              </div>

              <DialogFooter className="mt-4 shrink-0 sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsMapOpen(false)}
                  className="w-full sm:w-auto"
                >
                  取消
                </Button>
                <Button
                  type="button"
                  onClick={handleConfirmMapSelection}
                  disabled={!selectedAddress || !selectedLocation}
                  className="mt-2 w-full sm:mt-0 sm:w-auto"
                >
                  确认选择
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {showTips && tips.length > 0 && (
          <ul className="absolute z-50 mt-1 max-h-60 w-full translate-y-0 divide-y divide-gray-100 overflow-auto rounded-md border border-gray-200 bg-white opacity-100 shadow-lg transition-all duration-200">
            {tips.map((tip) => (
              <li
                key={tip.id}
                className="flex cursor-pointer flex-col px-4 py-3 text-sm transition-colors hover:bg-gray-50 active:bg-gray-100"
                onMouseDown={(e) => {
                  e.preventDefault(); // 阻止失焦
                  handleSelectTip(tip);
                }}
              >
                <span className="font-medium text-gray-900">{tip.name}</span>
                <span className="mt-1 truncate text-xs text-gray-500">
                  {tip.district}
                  {typeof tip.address === "string" ? tip.address : ""}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  },
);

AddressMapSelector.displayName = "AddressMapSelector";
