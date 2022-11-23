import SyntaxHighlighter from "react-syntax-highlighter";
import { AddIcon } from "@chakra-ui/icons";
import { Button, Input, InputGroup, InputLeftAddon, InputRightAddon } from "@chakra-ui/react";
import clsx from "clsx";

import JsonEditor from "@/components/Editor/JsonEditor";

import useDBMStore from "../../../store";
export default function DataPannel() {
  const { entryList, updateCurrentData, currentData } = useDBMStore((store) => store);

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
                className={clsx(
                  "border mt-4 p-2 rounded-md relative group hover:border-green-600",
                  {
                    "border-green-600": currentData?._id === item._id,
                  },
                )}
                onClick={() => {
                  updateCurrentData(item);
                }}
              >
                <div className=" absolute right-2 top-2 hidden group-hover:block z-50 ">
                  <Button
                    size="xs"
                    px="2"
                    className="mr-2 w-16"
                    onClick={() => {
                      updateCurrentData(item);
                    }}
                  >
                    Edit
                  </Button>
                  <Button size="xs" px="2" className="w-16">
                    Delete
                  </Button>
                </div>
                <SyntaxHighlighter language="json" customStyle={{ background: "#fff" }}>
                  {JSON.stringify(item, null, 2)}
                </SyntaxHighlighter>
              </div>
            );
          })}
        </div>

        {typeof currentData !== "undefined" ? (
          <div className="flex-1 w-2/5 border ml-4 mt-4 rounded">
            <div className="flex justify-between p-2 border-b mb-4">
              <span>编辑</span>
              <Button size={"xs"} borderRadius="2" px="4" onClick={() => {}}>
                保存
              </Button>
            </div>
            <JsonEditor value={currentData} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
