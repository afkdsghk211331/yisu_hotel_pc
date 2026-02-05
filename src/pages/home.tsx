import { useEffect, useState } from "react";
import { getLocationByIP, type IPResult } from "../api/amap";
import useMapcontainer from "../hooks/useMapcontainer";

const Home = () => {
  const [location, setLocation] = useState<IPResult | null>(null);
  useEffect(() => {
    getLocationByIP("114.247.50.2").then((res) => {
      console.log("IP定位结果：", res.data);
      setLocation(res.data);
    });
  }, []);

  useMapcontainer();

  return (
    <div>
      <h1 className="text-2xl font-semibold">易宿酒店预订系统</h1>
      <p>根据IP定位到的城市信息：</p>
      <pre>
        {location?.province}
        {location?.city}
      </pre>
      <div id="container" className="mt-20 h-40 w-80"></div>
    </div>
  );
};

export default Home;
