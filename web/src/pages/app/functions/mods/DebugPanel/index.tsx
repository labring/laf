import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Button,
  Center,
  Select,
  Spinner,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Tooltip,
  useColorMode,
} from "@chakra-ui/react";
import axios from "axios";
import clsx from "clsx";
import { keyBy, mapValues } from "lodash";

import JSONViewer from "@/components/Editor/JSONViewer";
import { Row } from "@/components/Grid";
import Panel from "@/components/Panel";
import Resize from "@/components/Resize";
import { COLOR_MODE, Pages, PanelMinHeight } from "@/constants";
import { encodeData } from "@/utils/handleData";

import { useCompileMutation, useUpdateDebugFunctionMutation } from "../../service";
import useFunctionStore from "../../store";
import AIChatPanel from "../AIChatPanel";
import VersionHistoryPanel from "../VersionHistoryPanel";

import BodyParamsTab from "./BodyParamsTab";
import QueryParamsTab from "./QueryParamsTab";
import HeaderParamsTab from "./QueryParamsTab";

import { TMethod } from "@/apis/typing";
import useFunctionCache from "@/hooks/useFunctionCache";
import useHotKey, { DEFAULT_SHORTCUTS } from "@/hooks/useHotKey";
import useCustomSettingStore from "@/pages/customSetting";
import useGlobalStore from "@/pages/globalStore";
import useSiteSettingStore from "@/pages/siteSetting";

const HAS_BODY_PARAMS_METHODS: (TMethod | undefined)[] = ["POST", "PUT", "PATCH", "DELETE"];

export default function DebugPanel(props: { containerRef: any }) {
  const { t } = useTranslation();
  const {
    getFunctionUrl,
    currentFunction,
    setCurrentRequestId,
    setCurrentFuncLogs,
    setCurrentFuncTimeUsage,
  } = useFunctionStore((state: any) => state);
  const updateDebugFunctionMutation = useUpdateDebugFunctionMutation();
  const globalStore = useGlobalStore((state) => state);
  const siteSettings = useSiteSettingStore((state) => state.siteSettings);

  const functionCache = useFunctionCache();

  const [runningResData, setRunningResData] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [runningMethod, setRunningMethod] = useState<TMethod>();
  const [isHovered, setIsHovered] = useState(false);

  const compileMutation = useCompileMutation();
  const { colorMode } = useColorMode();
  const darkMode = colorMode === COLOR_MODE.dark;

  const [queryParams, setQueryParams] = useState([]);
  const [bodyParams, setBodyParams] = useState<{ contentType: string; data: any }>();
  const [headerParams, setHeaderParams] = useState([]);

  const [abortController, setAbortController] = useState(new AbortController());

  const functionPageConfig = useCustomSettingStore((store) => store.layoutInfo.functionPage);
  const { displayName } = useHotKey(
    DEFAULT_SHORTCUTS.send_request,
    () => {
      runningCode();
    },
    {
      enabled: globalStore.currentPageId === Pages.function,
    },
  );

  const methods_tab = [
    {
      label: "Query",
      count: queryParams.length,
      shouldRender: true,
    },
    {
      label: "Body",
      count: Object.keys(bodyParams?.data || {}).length,
      shouldRender: HAS_BODY_PARAMS_METHODS.includes(runningMethod),
    },
    {
      label: "Headers",
      count: headerParams.length,
      shouldRender: true,
    },
  ];

  useEffect(() => {
    const lastRunningMethod = currentFunction.params?.runningMethod;
    if (
      currentFunction?.methods &&
      lastRunningMethod &&
      currentFunction.methods.includes(lastRunningMethod)
    ) {
      setRunningMethod(lastRunningMethod);
    } else if (currentFunction?.methods) {
      setRunningMethod(currentFunction.methods[0]);
    }
  }, [currentFunction]);

  useEffect(() => {
    setBodyParams(currentFunction?.params?.bodyParams);
  }, [currentFunction]);

  const runningCode = async () => {
    if (isLoading || !currentFunction?._id) return;
    setIsLoading(true);
    try {
      const compileRes = await compileMutation.mutateAsync({
        code: functionCache.getCache(currentFunction!._id, currentFunction!.source?.code),
        name: currentFunction!.name,
      });

      const params = {
        queryParams: queryParams,
        bodyParams: bodyParams,
        headerParams: headerParams,
        runningMethod: runningMethod,
      };

      await updateDebugFunctionMutation.mutateAsync({
        name: currentFunction?.name,
        params: params,
      });

      if (!compileRes.error) {
        const _funcData = JSON.stringify(compileRes.data);
        const axiosInstance = axios.create({
          validateStatus: function (status) {
            return status === 500 ? true : status >= 200 && status < 300;
          },
        });
        const signal = abortController.signal;
        const res = await axiosInstance({
          url: getFunctionUrl(),
          method: runningMethod,
          params: mapValues(keyBy(queryParams, "name"), "value"),
          data: bodyParams?.data,
          headers: Object.assign(mapValues(keyBy(headerParams, "name"), "value"), {
            "x-laf-develop-token": `${globalStore.currentApp?.develop_token}`,
            "x-laf-debug-data": encodeData(_funcData),
            "Content-Type": bodyParams?.contentType || "application/json",
          }),
          signal,
        });

        setCurrentRequestId(res.headers["request-id"]);
        setCurrentFuncLogs(res.headers["x-laf-debug-logs"]);
        setCurrentFuncTimeUsage(res.headers["x-laf-debug-time-usage"]);

        setRunningResData(res.data);
      }

      return () => abortController.abort();
    } catch (error: any) {
      setRunningResData(error.toString());
    } finally {
      setIsLoading(false);
    }
  };

  const cancelRequest = () => {
    abortController.abort();
    setAbortController(new AbortController());
  };

  return (
    <>
      <Panel className="min-w-[200px] flex-grow overflow-hidden !px-0">
        <Tabs
          width="100%"
          colorScheme={"primary"}
          display="flex"
          flexDirection={"column"}
          h="full"
          size={"sm"}
          pt={"4px"}
        >
          <TabList
            h={`${PanelMinHeight}px`}
            mx={3}
            borderBottom={darkMode ? "" : "2px solid #F6F8F9"}
          >
            <Tab
              _selected={{
                borderColor: "primary.500",
                color: darkMode ? "white !important" : "#262A32 !important",
              }}
              style={{ color: "#7B838B", margin: "-1px 8px", padding: "0 0", fontWeight: 500 }}
            >
              {t("FunctionPanel.InterfaceDebug")}
            </Tab>
            {!!siteSettings.ai_pilot_url?.value && (
              <Tab
                _selected={{
                  borderColor: "primary.500",
                  color: darkMode ? "white !important" : "#262A32 !important",
                }}
                style={{ color: "#7B838B", margin: "-1px 8px", padding: "0 0", fontWeight: 500 }}
              >
                Laf Pilot
              </Tab>
            )}
            <Tab
              _selected={{
                borderColor: "primary.500",
                color: darkMode ? "white !important" : "#262A32 !important",
              }}
              style={{ color: "#7B838B", margin: "-1px 8px", padding: "0 0", fontWeight: 500 }}
            >
              {t("FunctionPanel.versionHistory")}
            </Tab>
          </TabList>

          <TabPanels flex={1} className="overflow-hidden">
            <TabPanel
              padding={0}
              mt="1px"
              h="full"
              className={
                darkMode ? "flex flex-col bg-lafDark-100" : "flex flex-col bg-grayModern-100"
              }
            >
              <Panel className="flex-1 flex-col">
                <div className="flex flex-none items-center px-2 pb-2 pt-3">
                  <span className="mr-3 whitespace-nowrap font-medium text-grayModern-500">
                    {t("FunctionPanel.Methods")}
                  </span>
                  <Select
                    width="100px"
                    variant="filled"
                    size="xs"
                    value={runningMethod}
                    disabled={getFunctionUrl() === "" || !currentFunction.methods?.length}
                    onChange={(e) => {
                      setRunningMethod(e.target.value as TMethod);
                    }}
                  >
                    {currentFunction.methods?.map((item: string) => {
                      return (
                        <option value={item} key={item}>
                          {item}
                        </option>
                      );
                    })}
                  </Select>
                  <Tooltip
                    label={isLoading ? "" : `${t("shortcutKey")} ${displayName.toUpperCase()}`}
                  >
                    <Button
                      disabled={getFunctionUrl() === ""}
                      className={clsx(
                        "relative ml-2 !h-6 !w-14 !text-base",
                        isLoading ? "!bg-primary-400" : "!bg-primary-600 ",
                      )}
                      onClick={() => (isLoading ? cancelRequest() : runningCode())}
                      onMouseEnter={() => setIsHovered(true)}
                      onMouseLeave={() => setIsHovered(false)}
                    >
                      {isLoading ? (
                        <>
                          {isHovered ? (
                            t("Cancel")
                          ) : (
                            <Center>
                              <Spinner size={"xs"} />
                            </Center>
                          )}
                        </>
                      ) : (
                        t("FunctionPanel.Debug")
                      )}
                    </Button>
                  </Tooltip>
                </div>
                <div className="flex-grow overflow-hidden">
                  <Tabs
                    variant="soft-rounded"
                    colorScheme={"gray"}
                    size={"sm"}
                    className="h-full flex-col"
                    style={{ display: "flex" }}
                  >
                    <TabList>
                      {methods_tab.map(
                        (tab, index) =>
                          tab.shouldRender && (
                            <Tab key={index} className="!font-medium">
                              {tab.label}
                              {tab.count > 0 && <span className="ml-1">({tab.count})</span>}
                            </Tab>
                          ),
                      )}
                    </TabList>
                    <TabPanels className="relative flex-1 overflow-auto">
                      <TabPanel px={0} py={2}>
                        <QueryParamsTab
                          key={"QueryParamsTab"}
                          onChange={(values: any) => {
                            setQueryParams(values);
                          }}
                          paramsList={currentFunction.params?.queryParams}
                        />
                      </TabPanel>

                      {HAS_BODY_PARAMS_METHODS.includes(runningMethod) && (
                        <TabPanel
                          px={0}
                          py={2}
                          className="absolute bottom-0 left-0 right-0 top-0 overflow-auto"
                        >
                          <BodyParamsTab
                            onChange={(values) => {
                              setBodyParams(values);
                            }}
                            paramsList={currentFunction.params?.bodyParams}
                          />
                        </TabPanel>
                      )}

                      <TabPanel px={0} py={2}>
                        <HeaderParamsTab
                          key={"HeaderParamsTab"}
                          onChange={(values: any) => {
                            setHeaderParams(values);
                          }}
                          paramsList={currentFunction.params?.headerParams}
                        />
                      </TabPanel>
                    </TabPanels>
                  </Tabs>
                </div>
              </Panel>
              <Resize
                type="y"
                pageId="functionPage"
                panelId="RunningPanel"
                reverse
                containerRef={props.containerRef}
              />
              <Row {...functionPageConfig.RunningPanel} className="flex-1">
                <Panel className="min-w-[200px]">
                  <Panel.Header
                    title={t("FunctionPanel.DebugResult")}
                    pageId="functionPage"
                    panelId="RunningPanel"
                  />
                  <div className="h-full flex-1 overflow-auto">
                    {isLoading ? (
                      <Center className="h-full">
                        <Spinner />
                      </Center>
                    ) : runningResData !== undefined ? (
                      <JSONViewer
                        colorMode={colorMode}
                        code={JSON.stringify(runningResData, null, 2)}
                      />
                    ) : (
                      <Center className="h-full text-grayIron-600">
                        {t("FunctionPanel.EmptyDebugTip")}
                      </Center>
                    )}
                  </div>
                </Panel>
              </Row>
            </TabPanel>
            {!!siteSettings.ai_pilot_url?.value && (
              <TabPanel padding={0} h="full">
                <AIChatPanel />
              </TabPanel>
            )}
            <TabPanel padding={0} h="full">
              <VersionHistoryPanel />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Panel>
    </>
  );
}
