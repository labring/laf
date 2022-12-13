import React from "react";
import { Button, Input, Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";
import axios from "axios";

import JsonEditor from "@/components/Editor/JsonEditor";
import PanelHeader from "@/components/Panel/Header";

import useFunctionStore from "../../store";

export default function DebugPanel() {
  const { getFunctionUrl } = useFunctionStore((state) => state);
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
                    px="4"
                    className="ml-2"
                    onClick={() => {
                      axios({
                        url: getFunctionUrl(),
                        method: "GET",
                      });
                    }}
                    colorScheme="green"
                  >
                    运行 (⌘ + r)
                  </Button>
                </div>
                <div className="mx-2 pb-2 mb-2">调用参数:</div>
                <JsonEditor value={{ name: "test" }} />
              </div>
              <div className="flex-1 ">
                <PanelHeader className="bg-slate-100">日志</PanelHeader>
              </div>
            </div>
          </TabPanel>
          <TabPanel padding={0}>
            <p>two!</p>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  );
}
