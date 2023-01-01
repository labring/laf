import { useEffect, useState } from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
import {
  Button,
  Center,
  Input,
  InputGroup,
  InputRightElement,
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

import CopyText from "@/components/CopyText";
import JsonEditor from "@/components/Editor/JsonEditor";
import PanelHeader from "@/components/Panel/Header";
import { Pages } from "@/constants";

import { useCompileMutation } from "../../service";
import useFunctionStore from "../../store";

import useFunctionCache from "@/hooks/useFuncitonCache";
import useHotKey from "@/hooks/useHotKey";
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
    "r",
    () => {
      runningCode();
    },
    {
      enabled: globalStore.currentPageId === Pages.function,
    },
  );

  useHotKey(
    "s",
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
        const res = await axios({
          url: getFunctionDebugUrl(),
          method: runningMethod,
          data: {
            func: compileRes.data || "",
            param: JSON.parse(params),
          },
          headers: {
            "x-laf-debug-token": `${globalStore.currentApp?.function_debug_token}`,
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
    <div className="flex h-full">
      <Tabs width="100%">
        <TabList>
          <Tab>接口调试</Tab>
          <Tab>历史请求</Tab>
        </TabList>

        <TabPanels h="full">
          <TabPanel padding={0} h="full">
            <div className="flex flex-col h-full">
              <div className="flex-1 border-r-slate-300 flex flex-col">
                <div className="flex py-4 px-2 items-center">
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
                  <InputGroup className="ml-2">
                    <Input size="sm" readOnly rounded={4} value={getFunctionDebugUrl()} />
                    <InputRightElement>
                      <CopyText text={getFunctionDebugUrl()} className="mb-2" />
                    </InputRightElement>
                  </InputGroup>
                  <Button
                    style={{ borderRadius: 2 }}
                    size="sm"
                    px="6"
                    disabled={getFunctionDebugUrl() === ""}
                    className="ml-2"
                    onClick={() => runningCode()}
                    colorScheme="green"
                    isLoading={isLoading}
                  >
                    {t("FunctionPanel.Debug")} (⌘ + R)
                  </Button>
                </div>
                <div className="mx-2 pb-2 mb-2">调用参数:</div>
                <JsonEditor
                  onChange={(values) => {
                    setParams(values || "{}");
                  }}
                  value={params}
                />
              </div>
              <div className="flex-1 ">
                <PanelHeader className="bg-slate-100">运行结果</PanelHeader>
                <div className="relative">
                  {isLoading ? (
                    <div className="absolute left-0 right-0">
                      <Center>
                        <Spinner />
                      </Center>
                    </div>
                  ) : null}
                  {runningResData ? (
                    <SyntaxHighlighter language="json" customStyle={{ background: "#fff" }}>
                      {JSON.stringify(runningResData, null, 2)}
                    </SyntaxHighlighter>
                  ) : null}
                </div>
              </div>
            </div>
          </TabPanel>
          <TabPanel padding={0}>to be continued...</TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  );
}
