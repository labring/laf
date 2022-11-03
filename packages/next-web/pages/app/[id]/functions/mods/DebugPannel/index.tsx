import React from "react";
import { Button, HStack, Select, Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";

export default function DebugPanel() {
  return (
    <div className="h-full flex flex-col">
      <div className="px-2 bg-slate-100 flex" style={{ height: 30 }}>
        <HStack spacing="6">
          <div className="">接口调试</div>
          <div className="">历史请求</div>
        </HStack>
      </div>
      <div className="flex flex-1">
        <div style={{ width: 500 }} className="border border-r-indigo-400 ">
          <div className="flex p-2">
            <Button size="sm" className="mr-2">
              GET
            </Button>
            <Select size="sm" variant="filled" placeholder="Filled" />
            <Button size="sm" className="ml-2" colorScheme="brand">
              请求
            </Button>
          </div>
          <div className=" relative">
            <span className=" absolute top-2 right-4">历史请求</span>
            <Tabs>
              <TabList>
                <Tab>Params</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <p>one!</p>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </div>
        </div>
        <div className="flex-1 p-4">
          <h5>日志</h5>
        </div>
      </div>
    </div>
  );
}
