import React from "react";
import { Button, HStack, VStack } from "@chakra-ui/react";
import Editor, { useMonaco } from "@monaco-editor/react";

import useDBMStore from "../store";

import styles from "./index.module.scss";

export default function CollectionDataList() {
  const { entryList } = useDBMStore((store) => store);
  const monaco = useMonaco();

  monaco.editor.defineTheme("my-theme", {
    base: "vs",
    inherit: true,
    rules: [{ background: "EDF9FA" }],
    colors: {
      "editor.lineHighlightBackground": "#00000000",
      "editor.lineHighlightBorder": "#00000000",
    },
  });

  return (
    <div className="flex-1 m-4">
      <HStack spacing={2}>
        <Button size="sm">索引管理</Button>
        <Button size="sm">添加记录</Button>
      </HStack>
      <div className=" overflow-y-scroll h-full">
        {entryList?.map((item) => {
          return (
            <div key={item._id} className="border mt-4 p-2 rounded-sm relative group">
              <div className=" absolute right-2 top-0 hidden group-hover:block z-50">
                <Button size="sx" className="mr-2">
                  edit
                </Button>
                <Button size="sx">delete</Button>
              </div>
              <Editor
                theme="my-theme"
                language="json"
                defaultValue={JSON.stringify(item, null, 2)}
                width={"100%"}
                height="120px"
                options={{
                  readOnly: true,
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
          );
        })}
      </div>
    </div>
  );
}
