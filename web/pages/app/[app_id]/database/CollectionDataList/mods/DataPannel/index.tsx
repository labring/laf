import SyntaxHighlighter from "react-syntax-highlighter";
import { AddIcon } from "@chakra-ui/icons";
import {
  Button,
  Input,
  InputGroup,
  InputLeftAddon,
  InputRightAddon,
  useToast,
} from "@chakra-ui/react";
import clsx from "clsx";

import JsonEditor from "@/components/Editor/JsonEditor";

import useDBMStore from "../../../store";
export default function DataPannel() {
  const { entryList, updateCurrentData, currentData } = useDBMStore((store) => store);
  const toast = useToast();
  return (
    <>
      <div className="flex justify-between pb-2 shadow-sm">
        <InputGroup size="sm" className="h-9" style={{ width: 600 }}>
          <InputLeftAddon children="query" />
          <Input placeholder='{"name":"hello"}' />
          <InputRightAddon children="查询" />
        </InputGroup>
        <Button
          colorScheme={"blue"}
          size="sm"
          onClick={() => {
            updateCurrentData({});
          }}
        >
          <AddIcon color="white" />
          新增记录
        </Button>
      </div>

      <div className="absolute top-20 bottom-0 right-2 flex left-4">
        <div className="overflow-y-auto flex-1 pr-2">
          {entryList?.map((item, index: number) => {
            return (
              <div
                key={item._id}
                className={clsx(
                  "border p-2 rounded-md relative group hover:border-green-600 hover:shadow-md",
                  {
                    "border-green-600 shadow-md": currentData?._id === item._id,
                    "mb-6": index !== entryList.length - 1,
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
        <div
          className={clsx("flex-1 tarnsition-all duration-200 ease-in-out ", {
            "mr-2": typeof currentData !== "undefined",
          })}
          style={{
            maxWidth: typeof currentData !== "undefined" ? "50%" : "0",
          }}
        >
          <div
            className="border flex-col ml-2 flex rounded"
            style={{
              height: "-webkit-fill-available",
            }}
          >
            <div className="flex justify-between p-2 border-b mb-4">
              <span>编辑</span>
              <Button
                size={"xs"}
                borderRadius="2"
                px="4"
                onClick={() => {
                  toast({
                    position: "bottom-right",
                    title: "保存成功",
                    status: "success",
                    duration: 1000,
                  });
                }}
              >
                保存
              </Button>
            </div>
            <div className=" flex-1" style={{}}>
              <JsonEditor value={currentData} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
