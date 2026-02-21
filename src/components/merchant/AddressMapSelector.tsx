import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { MapPin, Loader2 } from "lucide-react";
import { getInputTips, InputTipResult } from "@/api/amap";
import { useDebounce } from "@/hooks/useDebounce";
import AMapLoader from "@amap/amap-jsapi-loader";

interface AddressMapSelectorProps {
  value: string;
  longitude?: string;
  latitude?: string;
  onChange: (address: string, location?: { lng: number; lat: number }) => void;
}

export function AddressMapSelector({ value, longitude, latitude, onChange }: AddressMapSelectorProps) {
  const [isMapOpen, setIsMapOpen] = useState(false);
  
  // 补全状态
  const [inputValue, setInputValue] = useState(value || "");
  const [tips, setTips] = useState<InputTipResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const debouncedSearchTerm = useDebounce(inputValue, 500);

  // 地图状态
  const mapContainerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const geocoderRef = useRef<any>(null);
  
  const [selectedLocation, setSelectedLocation] = useState<{lng: number, lat: number} | null>(
    longitude && latitude ? { lng: Number(longitude), lat: Number(latitude) } : null
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res = await getInputTips(keyword) as any;
      const data = res.data || res; // Handle both axios returning res or res.data
      
      if (data.status === "1" && data.tips?.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setTips(data.tips.filter((item: any) => typeof item.location === 'string' && item.location.length > 0));
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
        .then((AMap) => {
          // 在这期间弹窗可能已经关了，二次确认
          if (!mapContainerRef.current || !isMapOpen) return;
          if (mapRef.current) return;

          AMap.plugin(["AMap.Scale", "AMap.Geocoder", "AMap.AutoComplete", "AMap.Geolocation"], () => {
            const map = new AMap.Map(mapContainerRef.current, {
              viewMode: "2D",
              zoom: 15,
              // 取当前的 selectedLocation 设置中心点（这只会作为初始化基准，后续拖拽不影响这个初始值）
              center: selectedLocation ? [selectedLocation.lng, selectedLocation.lat] : [116.397428, 39.90923], // 默认北京
            });
            mapRef.current = map;

            const geocoder = new AMap.Geocoder({
              city: "全国",
            });
            geocoderRef.current = geocoder;

            const parseCenterAddress = () => {
              const center = map.getCenter();
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              geocoder.getAddress(center, (status: string, result: any) => {
                if (status === "complete" && result.info === "OK") {
                  const address = result.regeocode.formattedAddress;
                  setSelectedAddress(address);
                  setSelectedLocation({ lng: center.lng, lat: center.lat });
                } else {
                  console.error("逆地理编码失败:", status, result);
                  setSelectedAddress("获取地址失败，请拖拽重试");
                }
              });
            };

            map.on("moveend", parseCenterAddress);
            
            // 如果没有初始选中坐标，尝试使用浏览器定位
            if (!selectedLocation) {
              const geolocation = new AMap.Geolocation({
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0,
                convert: true,
                showButton: true,
                buttonPosition: 'RB',
                buttonOffset: new AMap.Pixel(10, 20),
                showMarker: false,
                showCircle: false,
                panToLocation: true,
                zoomToAccuracy: true
              });
              
              map.addControl(geolocation);
              
              setSelectedAddress("正在获取你的位置...");
              
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              geolocation.getCurrentPosition((status: string, result: any) => {
                 if (status === 'complete') {
                    // 定位成功后，地图会自动 panToLocation，触发 map 的 moveend 事件去重新解析地址
                    // 我们也可以在这里手动获取一下以免事件遗漏
                     const pos = result.position;
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
          });
        })
        .catch((e) => {
          console.error("AMap load error", e);
        });
    }, 400);

    return () => {
      if (timer) clearTimeout(timer);
    }
  }, [isMapOpen, selectedLocation]);

  const handleSelectTip = (tip: InputTipResult) => {
    try {
      const [lng, lat] = tip.location.split(",").map(Number);
      // 有的 tip.address 可能是数组或其他类型，我们尽可能拼接出详细文本
      const addressText = typeof tip.address === "string" && tip.address.length > 0 
        ? `${tip.district}${tip.address}${tip.name}` 
        : `${tip.district}${tip.name}`;
      
      setInputValue(addressText);
      setShowTips(false);
      onChange(addressText, { lng, lat });
    } catch(e) {
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
      <div className="flex gap-2 relative">
        <div className="relative flex-1">
          <Input
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
            <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-gray-400" />
          )}
        </div>
        
        <Dialog open={isMapOpen} onOpenChange={setIsMapOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" type="button" className="shrink-0">
              <MapPin className="mr-2 h-4 w-4" />
              定位
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] h-[600px] flex flex-col p-4 sm:p-6 overflow-hidden max-h-[90vh]">
            <DialogHeader className="shrink-0">
              <DialogTitle>在地图上选择位置</DialogTitle>
              <DialogDescription>
                拖拽地图以精确定位酒店位置
              </DialogDescription>
            </DialogHeader>
            <div className="relative flex-1 mt-4 rounded-md overflow-hidden border min-h-0 bg-gray-100">
              <div 
                ref={mapContainerRef} 
                className="w-full h-full"
              />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full pointer-events-none z-10 w-8 h-8 flex justify-center items-end drop-shadow-md pb-1">
                 <MapPin className="text-red-600 h-8 w-8 -mt-2 animate-bounce fill-white" />
              </div>
            </div>
            
            <div className="bg-gray-50 p-3 rounded-md mt-4 text-sm text-gray-700 min-h-[60px] flex items-center shrink-0 border border-gray-100">
              {selectedAddress ? (
                <>
                  <MapPin className="text-blue-500 h-5 w-5 mr-2 shrink-0" />
                  <span className="leading-relaxed">{selectedAddress}</span>
                </>
              ) : (
                <div className="flex items-center text-gray-500">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  正在获取当前位置...
                </div>
              )}
            </div>

            <DialogFooter className="mt-4 shrink-0 sm:justify-end">
              <Button type="button" variant="outline" onClick={() => setIsMapOpen(false)} className="w-full sm:w-auto">取消</Button>
              <Button type="button" onClick={handleConfirmMapSelection} disabled={!selectedAddress || !selectedLocation} className="w-full sm:w-auto mt-2 sm:mt-0">确认选择</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {showTips && tips.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto translate-y-0 opacity-100 transition-all duration-200 divide-y divide-gray-100">
          {tips.map((tip) => (
            <li
              key={tip.id}
              className="px-4 py-3 hover:bg-gray-50 active:bg-gray-100 cursor-pointer text-sm flex flex-col transition-colors"
              onMouseDown={(e) => {
                 e.preventDefault(); // 阻止失焦
                 handleSelectTip(tip)
              }}
            >
              <span className="font-medium text-gray-900">{tip.name}</span>
              <span className="text-gray-500 text-xs mt-1 truncate">{tip.district}{typeof tip.address === 'string' ? tip.address : ''}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
