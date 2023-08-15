import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";

import AreaCard from "./AreaCard";
import PieCard from "./PieCard";

import { MonitorControllerGetData } from "@/apis/v1/monitor";
import useGlobalStore from "@/pages/globalStore";

type TData = {
  xData: number;
  value: number;
};

type TPieData = {
  name: string;
  value: number;
};

type TDataArray = {
  metric: {
    pod: string;
  };
  values: any[];
}[];

export default function AppMonitor() {
  const [cpuData, setCpuData] = useState<TData[]>([]);
  const [memoryData, setMemoryData] = useState<TData[]>([]);
  const [cpuDataArray, setCpuDataArray] = useState<TDataArray>([]);
  const [memoryDataArray, setMemoryDataArray] = useState<TDataArray>([]);
  const [dataNumber, setDataNumber] = useState(0);
  const [databaseData, setDatabaseData] = useState<TPieData[]>([]);
  const [storageData, setStorageData] = useState<TPieData[]>([]);
  const { currentApp } = useGlobalStore();
  const { t } = useTranslation();

  const { isLoading } = useQuery(
    ["useGetMonitorDataQuery"],
    () => {
      return MonitorControllerGetData({
        q: ["cpuUsage", "memoryUsage", "databaseUsage", "storageUsage"],
        step: 60,
      });
    },
    {
      refetchInterval: 60000,
      onSuccess: (data) => {
        const databaseValue = data.data.databaseUsage[0]?.value[1] / 1024 / 1024 || 0;
        const databaseRemain = currentApp.bundle.resource.databaseCapacity - databaseValue;
        const storageValue = data.data.storageUsage[0]?.value[1] / 1024 / 1024 || 0;
        const storageRemain = currentApp.bundle.resource.storageCapacity - storageValue;
        setCpuDataArray(data.data.cpuUsage);
        setMemoryDataArray(data.data.memoryUsage);
        setDatabaseData([
          { name: `${t("Used")}`, value: databaseValue },
          { name: `${t("Remaining")}`, value: databaseRemain },
        ]);
        setStorageData([
          { name: `${t("Used")}`, value: storageValue },
          { name: `${t("Remaining")}`, value: storageRemain },
        ]);
      },
    },
  );

  useEffect(() => {
    setCpuData(
      cpuDataArray[dataNumber]?.values.map((item: any) => ({
        xData: item[0] * 1000,
        value: item[1],
      })),
    );
    setMemoryData(
      memoryDataArray[dataNumber]?.values.map((item: any) => ({
        xData: item[0] * 1000,
        value: item[1] / 1024 / 1024,
      })),
    );
  }, [cpuDataArray, memoryDataArray, dataNumber]);

  return (
    <div className="flex w-full">
      {isLoading ? null : (
        <>
          <div className="mr-2 mt-10 w-full rounded-xl border bg-[#F8FAFB] pb-4">
            <AreaCard
              data={cpuData}
              strokeColor="#47C8BF"
              fillColor="#E6F6F6"
              title="CPU"
              unit=" Core"
              maxValue={currentApp.bundle.resource.limitCPU / 1000}
              cpuDataArray={cpuDataArray}
              setDataNumber={setDataNumber}
              dataNumber={dataNumber}
            />
            <AreaCard
              data={memoryData}
              strokeColor="#9A8EE0"
              fillColor="#F2F1FB"
              title={t("Spec.RAM")}
              unit=" MB"
              maxValue={currentApp.bundle.resource.limitMemory}
              dataNumber={dataNumber}
            />
          </div>
          <div className="mr-2 mt-10 w-full space-y-2">
            <PieCard
              data={databaseData}
              title={t("Spec.Database")}
              colors={["#47C8BF", "#D5D6E1"]}
            />
            <PieCard data={storageData} title={t("Spec.Storage")} colors={["#9A8EE0", "#D5D6E1"]} />
          </div>
        </>
      )}
    </div>
  );
}
