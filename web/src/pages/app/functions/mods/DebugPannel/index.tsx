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
} from "@chakra-ui/react";
import axios from "axios";
import { t } from "i18next";

import JsonEditor from "@/components/Editor/JsonEditor";
import { Row } from "@/components/Grid";
import Panel from "@/components/Panel";
import { Pages } from "@/constants";

import { useCompileMutation } from "../../service";
import useFunctionStore from "../../store";

import useFunctionCache from "@/hooks/useFuncitonCache";
import useHotKey, { DEFAULT_SHORTCUTS } from "@/hooks/useHotKey";
import useGlobalStore from "@/pages/globalStore";

export default function DebugPanel() {
  const { getFunctionDebugUrl, currentFunction, setCurrentRequestId } = useFunctionStore(
    (state) => state,
  );

  const globalStore = useGlobalStore((state) => state);

  const functionCache = useFunctionCache();

  const [runningResData, setRunningResData] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [runningMethod, setRunningMethod] = useState<string>("");

  const compileMutation = useCompileMutation();

  const [params, setParams] = useState(JSON.stringify({ name: "test" }, null, 2));

  useHotKey(
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
        code: functionCache.getCache(currentFunction!.id),
        name: currentFunction!.name,
      });
      if (!compileRes.error) {
        const func_data = JSON.stringify(compileRes.data);
        const body_params = JSON.parse(params);
        const res = await axios({
          url: getFunctionDebugUrl(),
          method: runningMethod,
          data: body_params,
          headers: {
            "x-laf-debug-token": `${globalStore.currentApp?.function_debug_token}`,
            "x-laf-func-data": func_data,
          },
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
      <Row>
        <Panel className="flex-1">
          <Tabs width="100%" colorScheme={"green"} display="flex" flexDirection={"column"} h="full">
            <TabList>
              <Tab px="0">
                <span className="text-black font-semibold">接口调试</span>
              </Tab>
              {/* <Tab>历史请求</Tab> */}
            </TabList>

            <TabPanels flex={1}>
              <TabPanel padding={0} h="full">
                <div className="flex flex-col h-full">
                  <div className="flex py-4 px-2 items-center">
                    <span className="mr-3 whitespace-nowrap">请求类型</span>
                    <Select
                      width="150px"
                      size="sm"
                      value={runningMethod}
                      disabled={getFunctionDebugUrl() === ""}
                      onChange={(e) => {
                        setRunningMethod(e.target.value);
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
                    <Button
                      disabled={getFunctionDebugUrl() === ""}
                      className="ml-2"
                      onClick={() => runningCode()}
                      bg="#E0F6F4"
                      color="primary.500"
                      isLoading={isLoading}
                    >
                      {t("FunctionPanel.Debug")}
                    </Button>
                  </div>
                  <div className="mx-2 pb-2 mb-2">调用参数:</div>
                  <JsonEditor
                    onChange={(values) => {
                      setParams(values || "{}");
                    }}
                    height="calc(100vh - 500px)"
                    value={params}
                  />
                </div>
              </TabPanel>
              {/* <TabPanel padding={0}>to be continued...</TabPanel> */}
            </TabPanels>
          </Tabs>
        </Panel>
      </Row>
      <Row style={{ height: 500 }}>
        <Panel>
          <Panel.Header title="运行结果" />
          <div className="relative flex-1 overflow-auto">
            {isLoading ? (
              <div className="absolute left-0 right-0">
                <Center>
                  <Spinner />
                </Center>
              </div>
            ) : null}
            {runningResData ? (
              <SyntaxHighlighter
                language="json"
                customStyle={{ background: "#fff", height: "280px" }}
              >
                {JSON.stringify(runningResData, null, 2)}
              </SyntaxHighlighter>
            ) : null}
          </div>
        </Panel>
      </Row>
    </>
  );
}
