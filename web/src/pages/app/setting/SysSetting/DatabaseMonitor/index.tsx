import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Center, Spinner } from "@chakra-ui/react";
import { Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { ErrorIcon } from "@/components/CommonIcon";

import AreaCard from "./AreaCard";
import PieCard from "./PieCard";

import {
  DedicatedDatabaseMonitorControllerGetConnection,
  DedicatedDatabaseMonitorControllerGetPerformance,
  DedicatedDatabaseMonitorControllerGetResource,
} from "@/apis/v1/apps";
import useGlobalStore from "@/pages/globalStore";

export default function DatabaseMonitor() {
  const { t } = useTranslation();
  const { currentApp } = useGlobalStore();
  const {
    dedicatedDatabase: { limitCPU, limitMemory, capacity },
  } = currentApp.bundle.resource;

  const appid = currentApp.bundle.appid;

  const [podName, setPodName] = useState(t("All"));
  const queryClient = useQueryClient();

  const { isLoading: isConnectionLoading, data: connectionData } = useQuery(
    ["dedicatedDatabaseMonitorControllerGetConnection"],
    () => {
      return DedicatedDatabaseMonitorControllerGetConnection({});
    },
    {
      refetchInterval: 60000,
    },
  );

  const { isLoading: isResourceLoading, data: resourceData } = useQuery(
    ["dedicatedDatabaseMonitorControllerGetResource"],
    () => {
      return DedicatedDatabaseMonitorControllerGetResource({});
    },
    {
      refetchInterval: 60000,
    },
  );

  const { isLoading: isPerformanceLoading, data: performanceData } = useQuery(
    ["dedicatedDatabaseMonitorControllerGetPerformance"],
    () => {
      return DedicatedDatabaseMonitorControllerGetPerformance({});
    },
    {
      refetchInterval: 60000,
    },
  );

  const cpuData: {
    metric: Record<string, string>;
    values: Array<[number, string]>;
  }[] = resourceData?.data?.cpu;
  const memoryData: {
    metric: Record<string, string>;
    values: Array<[number, string]>;
  }[] = resourceData?.data?.memory;

  const podList = useMemo(() => {
    if (!cpuData || !memoryData) return [];
    const cpuPods = cpuData.map((item) => item.metric.pod);
    const memoryPods = memoryData.map((item) => item.metric.pod);

    const combinedPods = [...cpuPods, ...memoryPods];
    const uniquePods = [...new Set(combinedPods)];
    if (!uniquePods || uniquePods.length === 0) return [t("All")];
    return [t("All"), ...uniquePods];
  }, [cpuData, memoryData, t]);

  const [longestTick, setLongestTick] = useState("");
  const [longestTick1, setLongestTick1] = useState("");

  return (
    <Tabs variant="enclosed" isLazy={true}>
      <TabList>
        <Tab>{t("DatabaseMonitor.Resource")}</Tab>
        <Tab>{t("DatabaseMonitor.Performance")}</Tab>
      </TabList>
      <TabPanels>
        <TabPanel>
          <div className="flex w-full">
            {isConnectionLoading || isResourceLoading ? (
              <Center className="h-[430px] w-full">
                <Spinner />
              </Center>
            ) : connectionData?.data &&
              Object.keys(connectionData?.data).length !== 0 &&
              resourceData?.data &&
              Object.keys(resourceData?.data).length !== 0 ? (
              <>
                <div className="mr-3 mt-5 h-[430px] w-full rounded-xl border bg-[#F8FAFB] pb-4">
                  <AreaCard
                    data={resourceData?.data?.cpu}
                    strokeColor="#47C8BF"
                    fillColor="#E6F6F6"
                    setPodName={setPodName}
                    podName={podName}
                    podList={podList}
                    title="CPU"
                    unit="core"
                    maxValue={limitCPU / 1000}
                    className="h-1/3 p-4"
                    syncId="tab1"
                    longestTick={longestTick}
                    onLongestTickChange={(val) => setLongestTick(val)}
                  />
                  <AreaCard
                    data={resourceData?.data?.memory}
                    strokeColor="#9A8EE0"
                    fillColor="#F2F1FB"
                    title={t("Spec.RAM")}
                    unit="MB"
                    podList={podList}
                    maxValue={limitMemory}
                    podName={podName}
                    className="h-1/3 p-4"
                    syncId="tab1"
                    longestTick={longestTick}
                    onLongestTickChange={(val) => setLongestTick(val)}
                  />
                  <AreaCard
                    data={connectionData?.data?.connections}
                    strokeColor="#9A8EE0"
                    fillColor="#F2F1FB"
                    title={t("DatabaseMonitor.Connections")}
                    unit=""
                    podList={podList}
                    maxValue={0}
                    podName={podName}
                    className="h-1/3 p-4"
                    syncId="tab1"
                    longestTick={longestTick}
                    onLongestTickChange={(val) => setLongestTick(val)}
                  />
                </div>

                <div className="mt-5 h-[430px] w-full rounded-xl pb-0">
                  <PieCard
                    data={resourceData?.data?.dataSize || []}
                    maxValue={capacity}
                    title={t("DatabaseMonitor.Capacity")}
                    colors={["#47C8BF", "#D5D6E1"]}
                    appid={appid}
                  />
                </div>
              </>
            ) : (
              <Center className="h-[430px] w-full">
                <span className="flex flex-col items-center">
                  <ErrorIcon boxSize={16} />
                  <span className="flex pt-2 text-xl">
                    <p className="">{t("Error")}</p>
                    <u
                      className="cursor-pointer text-primary-600"
                      onClick={async () => {
                        await queryClient.invalidateQueries({
                          queryKey: [
                            "dedicatedDatabaseMonitorControllerGetResource",
                            "dedicatedDatabaseMonitorControllerGetPerformance",
                            "dedicatedDatabaseMonitorControllerGetConnection",
                          ],
                          refetchType: "all",
                        });
                      }}
                    >
                      {t("Retry")}
                    </u>
                  </span>
                </span>
              </Center>
            )}
          </div>
        </TabPanel>
        <TabPanel>
          <div className="flex w-full">
            {isPerformanceLoading ? (
              <Center className="h-[430px] w-full">
                <Spinner />
              </Center>
            ) : performanceData?.data && Object.keys(performanceData?.data).length !== 0 ? (
              <div className="mt-5 h-[430px] w-full rounded-xl border bg-[#F8FAFB] pb-4">
                <AreaCard
                  data={performanceData?.data?.documentOperations}
                  strokeColor="#47C8BF"
                  fillColor="#E6F6F6"
                  setPodName={setPodName}
                  podName={podName}
                  podList={podList}
                  title={t("DatabaseMonitor.DocumentOperand")}
                  unit=""
                  maxValue={0}
                  className="h-1/3 p-4"
                  syncId=""
                  longestTick={longestTick1}
                  onLongestTickChange={(val) => setLongestTick1(val)}
                />
                <AreaCard
                  data={performanceData?.data?.queryOperations}
                  strokeColor="#9A8EE0"
                  fillColor="#F2F1FB"
                  title={t("Spec.QueryOperand")}
                  unit=""
                  podList={podList}
                  maxValue={0}
                  podName={podName}
                  className="h-1/3 p-4"
                  syncId=""
                  longestTick={longestTick1}
                  onLongestTickChange={(val) => setLongestTick1(val)}
                />
                <AreaCard
                  data={performanceData?.data?.pageFaults}
                  strokeColor="#9A8EE0"
                  fillColor="#F2F1FB"
                  title={t("DatabaseMonitor.PageError")}
                  unit=""
                  podList={podList}
                  maxValue={0}
                  podName={podName}
                  className="h-1/3 p-4"
                  syncId=""
                  longestTick={longestTick1}
                  onLongestTickChange={(val) => setLongestTick1(val)}
                />
              </div>
            ) : (
              <Center className="h-[430px] w-full">
                <span className="flex flex-col items-center">
                  <ErrorIcon boxSize={16} />
                  <span className="flex pt-2 text-xl">
                    <p className="">{t("Error")}</p>
                    <u
                      className="cursor-pointer text-primary-600"
                      onClick={async () => {
                        await queryClient.invalidateQueries({
                          queryKey: [
                            "dedicatedDatabaseMonitorControllerGetResource",
                            "dedicatedDatabaseMonitorControllerGetPerformance",
                            "dedicatedDatabaseMonitorControllerGetConnection",
                          ],
                          refetchType: "all",
                        });
                      }}
                    >
                      {t("Retry")}
                    </u>
                  </span>
                </span>
              </Center>
            )}
          </div>
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
}
