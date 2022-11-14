import React from "react";
import { Button, HStack, Select, Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";
import Editor from "@monaco-editor/react";

export default function DebugPanel() {
  return (
    <div className="h-full flex flex-col">
      <div className="px-2 bg-slate-100 flex" style={{ height: 28 }}>
        <Tabs size={"sm"} width="100%">
          <TabList>
            <Tab>接口调试</Tab>
            <Tab>历史请求</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
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
                    <Button
                      style={{ borderRadius: 2 }}
                      size="xs"
                      className="ml-2"
                      colorScheme="primary"
                    >
                      &nbsp;&nbsp;发送&nbsp;&nbsp;
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
                <div className="flex-1 p-4">
                  <h5>日志</h5>
                </div>
              </div>
            </TabPanel>
            <TabPanel>
              <p>two!</p>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </div>
    </div>
  );
}
