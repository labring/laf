import { useEffect, useState } from "react";
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
import { t } from "i18next";
import { keyBy, mapValues } from "lodash";

import JSONViewer from "@/components/Editor/JSONViewer";
import { Row } from "@/components/Grid";
import Panel from "@/components/Panel";
import Resize from "@/components/Resize";
import { Pages } from "@/constants";

import { useCompileMutation } from "../../service";
import useFunctionStore from "../../store";

import BodyParamsTab from "./BodyParamsTab";
import QueryParamsTab from "./QueryParamsTab";
import HeaderParamsTab from "./QueryParamsTab";

import { TMethod } from "@/apis/typing";
import useFunctionCache from "@/hooks/useFunctionCache";
import useHotKey, { DEFAULT_SHORTCUTS } from "@/hooks/useHotKey";
import useCustomSettingStore from "@/pages/customSetting";
import useGlobalStore from "@/pages/globalStore";

const HAS_BODY_PARAMS_METHODS: (TMethod | undefined)[] = ["POST", "PUT", "PATCH", "DELETE"];

export default function DebugPanel(props: { containerRef: any }) {
  const { getFunctionUrl, currentFunction, setCurrentRequestId } = useFunctionStore(
    (state) => state,
  );
  const globalStore = useGlobalStore((state) => state);

  const functionCache = useFunctionCache();

  const [runningResData, setRunningResData] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [runningMethod, setRunningMethod] = useState<TMethod>();

  const compileMutation = useCompileMutation();
  const { colorMode } = useColorMode();
  const darkMode = colorMode === "dark";

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
      setRunningMethod(currentFunction.methods[0]);
    }
  }, [setRunningMethod, currentFunction]);

  const runningCode = async () => {
    if (isLoading || !currentFunction?.id) return;
    setIsLoading(true);
    try {
      const compileRes = await compileMutation.mutateAsync({
        code: functionCache.getCache(currentFunction!.id, currentFunction!.source?.code),
        name: currentFunction!.name,
      });

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
      <Panel className="min-w-[200px] flex-grow overflow-hidden">
        <Tabs width="100%" colorScheme={"primary"} display="flex" flexDirection={"column"} h="full">
          <TabList h={"50px"}>
            <Tab px="0">
              <span
                className={clsx("font-semibold", {
                  "text-black": !darkMode,
                  "text-white": darkMode,
                })}
              >
                {t("FunctionPanel.InterfaceDebug")}
              </span>
            </Tab>
            {/* <Tab>历史请求</Tab> */}
          </TabList>

          <TabPanels flex={1} className="overflow-hidden">
            <TabPanel padding={0} h="full">
              <div className="flex h-full flex-col">
                <div className="flex flex-none items-center px-2 py-4">
                  <span className="mr-3 whitespace-nowrap">{t("FunctionPanel.Methods")}</span>
                  <Select
                    width="150px"
                    variant="filled"
                    size="sm"
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
                    <TabPanels className="flex-grow overflow-auto">
                      <TabPanel px={0} py={1}>
                        <QueryParamsTab
                          key={"QueryParamsTab"}
                          onChange={(values: any) => {
                            setQueryParams(values);
                          }}
                        />
                      </TabPanel>

                      {HAS_BODY_PARAMS_METHODS.includes(runningMethod) && (
                        <TabPanel px={0} py={1} style={{ height: "100%", overflow: "auto" }}>
                          <BodyParamsTab
                            onChange={(values) => {
                              setBodyParams(values);
                            }}
                          />
                        </TabPanel>
                      )}

                      <TabPanel px={0} py={1}>
                        <HeaderParamsTab
                          key={"HeaderParamsTab"}
                          onChange={(values: any) => {
                            setHeaderParams(values);
                          }}
                        />
                      </TabPanel>
                    </TabPanels>
                  </Tabs>
                </div>
              </div>
            </TabPanel>
            {/* <TabPanel padding={0}>to be continued...</TabPanel> */}
          </TabPanels>
        </Tabs>
      </Panel>
      <Resize
        type="y"
        pageId="functionPage"
        panelId="RunningPanel"
        reverse
        containerRef={props.containerRef}
      />
      <Row {...functionPageConfig.RunningPanel}>
        <Panel className="min-w-[200px]">
          <Panel.Header title={t("FunctionPanel.DebugResult")} />
          <div className="relative flex-1 overflow-auto">
            {isLoading ? (
              <div className="absolute left-0 right-0">
                <Center>
                  <Spinner />
                </Center>
              </div>
            ) : null}
            {runningResData ? (
              <JSONViewer colorMode={colorMode} code={JSON.stringify(runningResData, null, 2)} />
            ) : (
              <Center minH={140} className="text-grayIron-600">
                {t("FunctionPanel.EmptyDebugTip")}
              </Center>
            )}
          </div>
        </Panel>
      </Row>
    </>
  );
}
