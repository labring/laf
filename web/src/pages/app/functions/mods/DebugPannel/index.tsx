import React, { useState } from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
import {
  Button,
  Center,
  Input,
  Spinner,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from "@chakra-ui/react";
import axios from "axios";

import JsonEditor from "@/components/Editor/JsonEditor";
import PanelHeader from "@/components/Panel/Header";

import useFunctionStore from "../../store";

import useHotKey from "@/hooks/useHotKey";

export default function DebugPanel() {
  const { getFunctionUrl } = useFunctionStore((state) => state);

  const [runningResData, setRunningResData] = useState();
  const [isLoading, setIsLoading] = useState(false);

  useHotKey("r", () => {
    runningCode();
  });

  const runningCode = async () => {
    if (isLoading) return;
    // TODO compile code
    setIsLoading(true);
    try {
      const res = await axios({
        url: getFunctionUrl(),
        method: "GET",
      });
      setRunningResData(res.data);
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
                  <Button size="sm" className="mr-2">
                    GET
                  </Button>
                  <Input size="sm" readOnly rounded={4} value={getFunctionUrl()} />
                  <Button
                    style={{ borderRadius: 2 }}
                    size="sm"
                    px="6"
                    disabled={getFunctionUrl() === ""}
                    className="ml-2"
                    onClick={() => runningCode()}
                    colorScheme="green"
                    isLoading={isLoading}
                  >
                    调试 (⌘ + R)
                  </Button>
                </div>
                <div className="mx-2 pb-2 mb-2">调用参数:</div>
                <JsonEditor value={{ name: "test" }} />
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
          <TabPanel padding={0}></TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  );
}
