import { useEffect, useState } from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
import { AddIcon } from "@chakra-ui/icons";
import { Button, Input, InputGroup, InputLeftAddon, InputRightAddon } from "@chakra-ui/react";
import Editor, { useMonaco } from "@monaco-editor/react";
import clsx from "clsx";

import useDBMStore from "../../../store";
export default function DataPannel() {
  const { entryList, updateCurrentData, currentData } = useDBMStore((store) => store);
  const [addData, setAddData] = useState(false);

  const monaco = useMonaco();

  monaco?.editor.defineTheme("myTheme", {
    base: "vs",
    inherit: true,
    rules: [{ background: "0055ee" }],
    colors: {
      "editorLineNumber.foreground": "#999",
      "editor.lineHighlightBackground": "#fff",
    },
  });

  useEffect(() => {
    monaco?.editor.setTheme("myTheme");
    return () => {};
  }, [monaco]);

  return (
    <div>
      <div className="flex mt-2 justify-between">
        <InputGroup size="sm" className="h-9" style={{ width: 600 }}>
          <InputLeftAddon children="query" />
          <Input placeholder='{"name":"hello"}' />
          <InputRightAddon children="查询" />
        </InputGroup>
        <Button
          colorScheme={"primary"}
          size="sm"
          onClick={() => {
            updateCurrentData({});
          }}
        >
          <AddIcon color="white" />
          新增记录
        </Button>
      </div>

      <div className="flex">
        <div className="flex-1 w-3/5">
          {entryList?.map((item) => {
            return (
              <div
                key={item._id}
                className={clsx("border  mt-4 p-2 rounded-md relative group hover:border-black", {
                  "border-black": currentData?._id === item._id,
                })}
                onClick={() => {
                  updateCurrentData(item);
                }}
              >
                <div className=" absolute right-2 top-0 hidden group-hover:block z-50">
                  <Button
                    size="sx"
                    className="mr-2"
                    onClick={() => {
                      updateCurrentData(item);
                    }}
                  >
                    edit
                  </Button>
                  <Button size="sx">delete</Button>
                </div>
                <SyntaxHighlighter language="json" customStyle={{ background: "#fff" }}>
                  {JSON.stringify(item, null, 2)}
                </SyntaxHighlighter>
              </div>
            );
          })}
        </div>

        {typeof currentData !== "undefined" ? (
          <div className="flex-1 w-2/5 border ml-4 mt-4">
            <div className="flex justify-end p-2 border-b mb-4">
              <Button size={"xs"} borderRadius="2" px="4" onClick={() => {}}>
                保存
              </Button>
            </div>
            <Editor
              theme="my-theme"
              language="json"
              value={JSON.stringify(currentData, null, 2)}
              width={"600"}
              height="400px"
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
                  alwaysConsumeMouseWheel: false,
                },
                lineNumbers: "off",
                lineNumbersMinChars: 0,
                scrollBeyondLastLine: false,
                folding: false,
                overviewRulerBorder: false,
                tabSize: 2, // tab 缩进长度
              }}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
