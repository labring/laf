import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Tooltip } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";

import { MonitorIcon } from "@/components/CommonIcon";
import { uniformCapacity, uniformCPU, uniformMemory, uniformStorage } from "@/utils/format";

import { MonitorControllerGetData } from "@/apis/v1/monitor";
import SysSetting from "@/pages/app/setting/SysSetting";
import useGlobalStore from "@/pages/globalStore";

export default function MonitorBar() {
  const { currentApp, monitorData, setMonitorData } = useGlobalStore();
  const { t } = useTranslation();
  const { limitCPU, limitMemory, databaseCapacity, storageCapacity } = currentApp.bundle.resource;

  const [cpuUsagePercent, setCpuUsagePercent] = useState(0);
  const [memoryUsagePercent, setMemoryUsagePercent] = useState(0);
  const [databaseUsagePercent, setDatabaseUsagePercent] = useState(0);
  const [storageUsagePercent, setStorageUsagePercent] = useState(0);

  useEffect(() => {
    if (!monitorData) return;
    const { cpuUsage, memoryUsage, databaseUsage, storageUsage } = monitorData;
    if (!cpuUsage?.length) return;
    setCpuUsagePercent(
      uniformCPU(Number(cpuUsage[0]?.values[cpuUsage[0].values.length - 1][1])) / limitCPU,
    );
    setMemoryUsagePercent(
      uniformMemory(Number(memoryUsage[0]?.values[memoryUsage[0].values.length - 1][1])) /
        limitMemory,
    );
    setDatabaseUsagePercent(
      uniformCapacity(Number(databaseUsage[0]?.value[1] || 0)) / databaseCapacity,
    );
    setStorageUsagePercent(
      uniformStorage(Number(storageUsage[0]?.value[1] || 0)) / storageCapacity,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monitorData]);

  useQuery(
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
        setMonitorData(data.data);
      },
    },
  );

  const resources = [
    { label: `CPU`, percent: cpuUsagePercent * 100, color: "[#47C8BF]" },
    { label: t("Spec.RAM"), percent: memoryUsagePercent * 100, color: "adora-600" },
    { label: t("Spec.Database"), percent: databaseUsagePercent * 100, color: "rose-500" },
    { label: t("Spec.Storage"), percent: storageUsagePercent * 100, color: "blue-600" },
  ];

  const limitPercentage = (value: number) => {
    if (value > 100) {
      return 100;
    }
    return value;
  };

  return (
    <div className="flex items-center space-x-2">
      <SysSetting currentTab="monitor">
        <span className="mr-2 flex h-full cursor-pointer items-center text-grayModern-500">
          <MonitorIcon className="mr-1" />
          {t("SettingPanel.AppMonitor") + " :"}
        </span>
      </SysSetting>
      {resources.map((resource, index) => (
        <Tooltip key={index} label={`${resource.label}: ${resource.percent.toFixed(2)}%`}>
          <div className="h-1 w-12 rounded-full bg-grayModern-100">
            <div
              style={{ width: `${limitPercentage(resource.percent).toFixed(2)}%` }}
              className={`h-full rounded-full bg-${resource.color}`}
            ></div>
          </div>
        </Tooltip>
      ))}
    </div>
  );
}
