import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import AreaCard from "./AreaCard";
import PieCard from "./PieCard";

import useGlobalStore from "@/pages/globalStore";

export default function AppMonitor() {
  const { t } = useTranslation();
  const { currentApp, monitorData } = useGlobalStore();
  const { limitCPU, limitMemory, databaseCapacity, storageCapacity } = currentApp.bundle.resource;
  const { cpuUsage, memoryUsage, databaseUsage, storageUsage } = monitorData || {
    cpuUsage: [],
    memoryUsage: [],
    databaseUsage: [],
    storageUsage: [],
  };
  const [dataNumber, setDataNumber] = useState(0);
  const [podsArray, setPodsArray] = useState<string[]>([]);

  useEffect(() => {
    setPodsArray(cpuUsage.map((item) => item.metric.pod));
  }, [cpuUsage]);

  return (
    <div className="flex w-full">
      <div className="mr-2 mt-10 h-[404px] w-full rounded-xl border bg-[#F8FAFB] pb-4">
        <AreaCard
          data={cpuUsage}
          strokeColor="#47C8BF"
          fillColor="#E6F6F6"
          setDataNumber={setDataNumber}
          dataNumber={dataNumber}
          podsArray={podsArray}
          title="CPU"
          unit="Core"
          maxValue={limitCPU / 1000}
          className="h-1/2 p-4"
        />
        <AreaCard
          data={memoryUsage}
          strokeColor="#9A8EE0"
          fillColor="#F2F1FB"
          title={t("Spec.RAM")}
          unit="MB"
          maxValue={limitMemory}
          dataNumber={dataNumber}
          className="h-1/2 p-4"
        />
      </div>
      <div className="mr-2 mt-10 h-[396px] w-full space-y-2">
        <PieCard
          data={databaseUsage}
          maxValue={databaseCapacity}
          title={t("Spec.Database")}
          colors={["#47C8BF", "#D5D6E1"]}
        />
        <PieCard
          data={storageUsage}
          maxValue={storageCapacity}
          title={t("Spec.Storage")}
          colors={["#9A8EE0", "#D5D6E1"]}
        />
      </div>
    </div>
  );
}
