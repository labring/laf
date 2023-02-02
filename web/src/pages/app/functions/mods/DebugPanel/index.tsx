import { useEffect, useState } from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
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
} from "@chakra-ui/react";
import axios from "axios";
import { t } from "i18next";
import { keyBy, mapValues } from "lodash";

import { Row } from "@/components/Grid";
import Panel from "@/components/Panel";
import { Pages } from "@/constants";

import { useCompileMutation } from "../../service";
import useFunctionStore from "../../store";

import BodyParamsTab from "./BodyParamsTab";
import QueryParamsTab from "./QueryParamsTab";
import HeaderParamsTab from "./QueryParamsTab";

import { TMethod } from "@/apis/typing";
import useFunctionCache from "@/hooks/useFunctionCache";
import useHotKey, { DEFAULT_SHORTCUTS } from "@/hooks/useHotKey";
import useGlobalStore from "@/pages/globalStore";

const HAS_BODY_PARAMS_METHODS: (TMethod | undefined)[] = ["POST", "PUT", "PATCH", "DELETE"];

export default function DebugPanel() {
  const { getFunctionUrl, currentFunction, setCurrentRequestId } = useFunctionStore(
    (state) => state,
  );
  const globalStore = useGlobalStore((state) => state);

  const functionCache = useFunctionCache();

  const [runningResData, setRunningResData] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [runningMethod, setRunningMethod] = useState<TMethod>();

  const compileMutation = useCompileMutation();

  const [queryParams, setQueryParams] = useState([]);
  const [bodyParams, setBodyParams] = useState({});
  const [headerParams, setHeaderParams] = useState([]);

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
          data: bodyParams,
          headers: Object.assign(mapValues(keyBy(headerParams, "name"), "value"), {
            "x-laf-debug-token": `${globalStore.currentApp?.function_debug_token}`,
            "x-laf-func-data": encodeURIComponent(_funcData),
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
      <Panel className="flex-grow overflow-hidden">
        <Tabs width="100%" colorScheme={"primary"} display="flex" flexDirection={"column"} h="full">
          <TabList h={"50px"}>
            <Tab px="0">
              <span className="text-black font-semibold">{t("FunctionPanel.InterfaceDebug")}</span>
            </Tab>
            {/* <Tab>历史请求</Tab> */}
          </TabList>

          <TabPanels flex={1} className="overflow-hidden">
            <TabPanel padding={0} h="full">
              <div className="flex flex-col h-full">
                <div className="flex-none flex py-4 px-2 items-center">
                  <span className="mr-3 whitespace-nowrap">{t("FunctionPanel.Methods")}</span>
                  <Select
                    width="150px"
                    variant="filled"
                    size="sm"
                    value={runningMethod}
                    disabled={getFunctionUrl() === ""}
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
                    <TabList className="mb-2 flex-none">
                      <Tab>
                        Parameters
                        {queryParams.length > 0 && (
                          <span className="ml-1">({queryParams.length})</span>
                        )}
                      </Tab>
                      {HAS_BODY_PARAMS_METHODS.includes(runningMethod) && (
                        <Tab>
                          Body
                          {Object.keys(bodyParams).length > 0 && (
                            <span className="ml-1">({Object.keys(bodyParams).length})</span>
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
      <Row style={{ height: "300px", overflow: "auto" }}>
        <Panel>
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
              <SyntaxHighlighter language="json" customStyle={{ background: "#fdfdfe" }}>
                {JSON.stringify(runningResData, null, 2)}
              </SyntaxHighlighter>
            ) : null}
          </div>
        </Panel>
      </Row>
    </>
  );
}
