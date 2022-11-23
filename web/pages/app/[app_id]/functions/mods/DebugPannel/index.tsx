import React from "react";
import { Button, Input, Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";
import Editor from "@monaco-editor/react";

import PanelHeader from "@/components/Panel/Header";

export default function DebugPanel() {
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
              <div className="flex-1 border-r-slate-300 ">
                <div className="flex py-6 px-2">
                  <Button size="xs" className="mr-2">
                    GET
                  </Button>
                  <Input
                    size="xs"
                    variant="filled"
                    defaultValue="https://qcphsd.api.cloudendpoint.cn/deleteCurrentTodo"
                  />
                  <Button
                    style={{ borderRadius: 2 }}
                    size="xs"
                    px="4"
                    className="ml-2"
                    colorScheme="blue"
                  >
                    发送
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
                            guides: {
                              indentation: false,
                            },
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
                            folding: false,
                            overviewRulerBorder: false,
                            roundedSelection: false,

                            tabSize: 2, // tab 缩进长度
                          }}
                        ></Editor>
                      </TabPanel>
                    </TabPanels>
                  </Tabs>
                </div>
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
