import React from "react";
import { Button, HStack, Select, Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";
import Editor from "@monaco-editor/react";

export default function DebugPanel() {
  return (
    <div className="h-full flex flex-col">
      <div className="px-2 bg-slate-100 flex" style={{ height: 28 }}>
        <HStack spacing="6">
          <div className="">接口调试</div>
          <div className="">历史请求</div>
        </HStack>
      </div>
      <div className="flex flex-1">
        <div style={{ width: 500 }} className="border-r border-r-slate-300 ">
          <div className="flex p-2">
            <Button size="xs" className="mr-2">
              GET
            </Button>
            <Select
              size="xs"
              variant="filled"
              placeholder="https://qcphsd.api.cloudendpoint.cn/deleteCurrentTodo"
            />
            <Button style={{ borderRadius: 2 }} size="xs" className="ml-2" colorScheme="brand">
              &nbsp;&nbsp;请求&nbsp;&nbsp;
            </Button>
          </div>
          <div className=" relative">
            <Tabs size={"sm"}>
              <TabList>
                <Tab>参数</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <Editor
                    theme="light"
                    height="100px"
                    defaultLanguage="json"
                    value={`{\n\t"name":"hello"\n}`}
                    options={{
                      lineNumber: false,
                      minimap: {
                        enabled: false,
                      },
                      lineHighlightBackground: "red",
                      scrollbar: {
                        verticalScrollbarSize: 0,
                      },
                      lineNumbers: "off",
                      lineNumbersMinChars: 0,
                      scrollBeyondLastLine: false,
                    }}
                  ></Editor>
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
