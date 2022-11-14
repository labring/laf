
import { Button, HStack, Input, InputGroup, InputLeftAddon, InputRightAddon, VStack } from "@chakra-ui/react";
import Editor, { useMonaco } from "@monaco-editor/react";
import useDBMStore from "../../../store";
import { AddIcon } from "@chakra-ui/icons";
import { useState } from "react";
export default function DataPannel() {
  const { entryList } = useDBMStore((store) => store);
  const [addData, setAddData] = useState(false)

  return (
    <div>
      <div className="flex mt-2">
        <div className="flex items-center justify-center h-8 w-24 bg-black">
          <AddIcon color='white' /><span className="text-white" onClick={() => setAddData(true)}>新增记录</span>
        </div>
        <InputGroup size='sm' className="ml-6 h-9">
          <InputLeftAddon children='query' />
          <Input placeholder='{"name":"hello"}' />
          <InputRightAddon children='查询' />
        </InputGroup>
      </div>

      <div className="flex">
        <div className="flex-1">
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
          })
          }

        </div>

        <div className="flex-1 border w-1/4 ml-2 mt-4">
          <div className="flex justify-between mt-4 p-4">
            <div className="text-base">
              添加数据
            </div>
            <Button size="lg" colorScheme="teal">保存</Button>
          </div>
          <Editor
            theme="my-theme"
            language="json"
            defaultValue={`{}`}
            width={"100%"}
            height="120px"
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
      </div>
    </div >
  )

}
