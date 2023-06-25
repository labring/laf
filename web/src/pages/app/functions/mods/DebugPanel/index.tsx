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

import { useCompileMutation, useUpdateFunctionMutation } from "../../service";
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

const HAS_BODY_PARAMS_METHODS: (TMethod | undefined)[] = ["POST", "PUT", "PATCH", "DELETE"];

export default function DebugPanel(props: { containerRef: any; showOverlay: boolean }) {
  const { t } = useTranslation();
  const { getFunctionUrl, currentFunction, setCurrentFunction, setCurrentRequestId } =
    useFunctionStore((state: any) => state);
  const updateFunctionMutation = useUpdateFunctionMutation();
  const globalStore = useGlobalStore((state) => state);

  const functionCache = useFunctionCache();

  const [runningResData, setRunningResData] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [runningMethod, setRunningMethod] = useState<TMethod>();

  const compileMutation = useCompileMutation();
  const { colorMode } = useColorMode();
  const darkMode = colorMode === COLOR_MODE.dark;

  const [queryParams, setQueryParams] = useState([]);
  const [bodyParams, setBodyParams] = useState<{ contentType: string; data: any }>();
  const [headerParams, setHeaderParams] = useState([]);
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

  useEffect(() => {
    if (currentFunction?.methods) {
      setRunningMethod(currentFunction.params?.runningMethod || currentFunction.methods[0]);
    }
  }, [setRunningMethod, currentFunction]);

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

      updateFunctionMutation.mutateAsync({
        description: currentFunction?.desc,
        code: currentFunction?.source.code,
        methods: currentFunction?.methods,
        websocket: currentFunction?.websocket,
        name: currentFunction?.name,
        tags: currentFunction?.tags,
        params: params,
      });

      setCurrentFunction({ ...currentFunction, params: params });

      if (!compileRes.error) {
        const _funcData = JSON.stringify(compileRes.data);
        const res = await axios({
          url: getFunctionUrl(),
          method: runningMethod,
          params: mapValues(keyBy(queryParams, "name"), "value"),
          data: bodyParams?.data,
          headers: Object.assign(mapValues(keyBy(headerParams, "name"), "value"), {
            "x-laf-develop-token": `${globalStore.currentApp?.develop_token}`,
            "x-laf-func-data": encodeURIComponent(_funcData),
            "Content-Type": bodyParams?.contentType || "application/json",
          }),
        });

        setCurrentRequestId(res.headers["request-id"]);

        setRunningResData(res.data);
      }
    } catch (error: any) {
      setRunningResData(error.toString());
    } finally {
      setIsLoading(false);
    }
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
        >
          <TabList h={`${PanelMinHeight}px`}>
            <Tab px="4">
              <span
                className={clsx("font-semibold", {
                  "text-black": !darkMode,
                  "text-white": darkMode,
                })}
              >
                {t("FunctionPanel.InterfaceDebug")}
              </span>
            </Tab>
            {/* <Tab px="4">
              <span
                className={clsx("font-semibold", {
                  "text-black": !darkMode,
                  "text-white": darkMode,
                })}
              >
                {t("HomePage.NavBar.docs")}
              </span>
            </Tab> */}
            <Tab>
              <span
                className={clsx("font-semibold", {
                  "text-black": !darkMode,
                  "text-white": darkMode,
                })}
              >
                Laf Pilot
              </span>
            </Tab>
            <Tab>
              <span
                className={clsx("font-semibold", {
                  "text-black": !darkMode,
                  "text-white": darkMode,
                })}
              >
                {t("FunctionPanel.versionHistory")}
              </span>
            </Tab>
          </TabList>

          <TabPanels flex={1} className="overflow-hidden">
            <TabPanel
              padding={0}
              h="full"
              className={
                darkMode ? "flex flex-col bg-lafDark-100" : "flex flex-col bg-grayModern-100"
              }
            >
              <Panel className="flex-1 flex-col">
                <div className="flex flex-none items-center px-2 py-4">
                  <span className="mr-3 whitespace-nowrap">{t("FunctionPanel.Methods")}</span>
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
                  <Tooltip label={`快捷键: ${displayName.toUpperCase()}`}>
                    <Button
                      variant={"secondary"}
                      size={"xs"}
                      disabled={getFunctionUrl() === ""}
                      className="ml-2"
                      onClick={() => runningCode()}
                      isLoading={isLoading}
                    >
                      {t("FunctionPanel.Debug")}
                    </Button>
                  </Tooltip>
                </div>
                <div className="flex-grow overflow-hidden">
                  <Tabs
                    p="0"
                    variant="soft-rounded"
                    colorScheme={"gray"}
                    size={"sm"}
                    className="h-full flex-col"
                    style={{ display: "flex" }}
                  >
                    <TabList className="mb-1 flex-none">
                      <Tab>
                        Query
                        {queryParams.length > 0 && (
                          <span className="ml-1">({queryParams.length})</span>
                        )}
                      </Tab>
                      {HAS_BODY_PARAMS_METHODS.includes(runningMethod) && (
                        <Tab>
                          Body
                          {Object.keys(bodyParams?.data || {}).length > 0 && (
                            <span className="ml-1">({Object.keys(bodyParams?.data).length})</span>
                          )}
                        </Tab>
                      )}
                      <Tab>
                        Headers
                        {headerParams.length > 0 && (
                          <span className="ml-1">({headerParams.length})</span>
                        )}
                      </Tab>
                    </TabList>
                    <TabPanels className="relative flex-1 overflow-auto">
                      <TabPanel px={0} py={1}>
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
                          py={1}
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

                      <TabPanel px={0} py={1}>
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
                  <div className="relative flex-1 overflow-auto">
                    {isLoading ? (
                      <div className="absolute left-0 right-0">
                        <Center>
                          <Spinner />
                        </Center>
                      </div>
                    ) : null}
                    {runningResData ? (
                      <JSONViewer
                        colorMode={colorMode}
                        code={JSON.stringify(runningResData, null, 2)}
                      />
                    ) : (
                      <Center minH={140} className="text-grayIron-600">
                        {t("FunctionPanel.EmptyDebugTip")}
                      </Center>
                    )}
                  </div>
                </Panel>
              </Row>
            </TabPanel>
            {/* <TabPanel padding={0} h="full">
              {props.showOverlay && (
                <div
                  style={{
                    position: "fixed",
                    width: "100%",
                    height: "100%",
                    backgroundColor: "rgba(0, 0, 0, 0)",
                    zIndex: 999,
                  }}
                />
              )}
              <iframe
                title="docs"
                height={"100%"}
                width={"100%"}
                src={String(t("HomePage.DocsLink"))}
              />
            </TabPanel> */}
            <TabPanel padding={0} h="full">
              <AIChatPanel />
            </TabPanel>
            <TabPanel padding={0} h="full">
              <VersionHistoryPanel />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Panel>
    </>
  );
}
