import { useState } from "react";
import { useColorMode } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { t } from "i18next";

import { StandardIcon } from "@/components/CommonIcon";

import PricingCard from "./PricingCard";

import { ResourceControllerCalculatePrice } from "@/apis/v1/resources";
import useGlobalStore from "@/pages/globalStore";

type price = {
  cpu: number;
  memory: number;
  databaseCapacity: number;
  storageCapacity: number;
  networkTraffic: number;
  total: number;
};

export default function PricingStandards() {
  const { regions } = useGlobalStore((state) => state);

  const darkMode = useColorMode().colorMode === "dark";
  const [price, setPrice] = useState<price>({
    cpu: 0,
    memory: 0,
    databaseCapacity: 0,
    storageCapacity: 0,
    networkTraffic: 0,
    total: 0,
  });

  useQuery(
    ["useBillingPriceQuery"],
    async () => {
      return ResourceControllerCalculatePrice({
        cpu: 1000,
        memory: 1024,
        databaseCapacity: 1024,
        storageCapacity: 1024,
        networkTraffic: 1024, // 1G
        regionId: regions && regions[0].bundles[0].regionId,
      });
    },
    {
      onSuccess(res) {
        setPrice((res?.data as price) || {});
      },
    },
  );

  const { cpu, memory, databaseCapacity, storageCapacity, networkTraffic } = price;

  const pricingData = [
    { color: "bg-primary-500", title: "CPU", value: cpu },
    { color: "bg-blue-600", title: "内存", value: memory },
    { color: "bg-error-400", title: "数据库", value: databaseCapacity },
    { color: "bg-error-400", title: "云存储", value: storageCapacity },
    { color: "bg-adora-600", title: "出网流量", value: networkTraffic },
  ];

  return (
    <div>
      <div className="flex items-center space-x-2 pt-2 text-2xl">
        <StandardIcon size={20} color={darkMode ? "#F4F6F8" : "#24282C"} />
        <p>{t("SettingPanel.PricingStandards")}</p>
      </div>
      <div className="flex justify-center pt-10">
        {pricingData.map((data) => (
          <PricingCard color={data.color} title={data.title} value={data.value} key={data.title} />
        ))}
      </div>
    </div>
  );
}
