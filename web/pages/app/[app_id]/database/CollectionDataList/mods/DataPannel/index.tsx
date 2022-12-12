import { useState } from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
import { AddIcon } from "@chakra-ui/icons";
import { Button } from "@chakra-ui/react";
import clsx from "clsx";
import useGlobalStore from "pages/globalStore";

import JsonEditor from "@/components/Editor/JsonEditor";

import { useEntryDataQuery } from "../../../service";

import DeleteButton from "./DeleteButton";
export default function DataPannel() {
  const { showSuccess } = useGlobalStore();

  const entryDataQuery = useEntryDataQuery();

  const [currentData, setCurrentData] = useState<any>(null);
  return (
    <>
      <div className="flex pb-2 mt-2 shadow-sm">
        <Button colorScheme={"primary"} size="sm" onClick={() => {}}>
          <AddIcon color="white" className="mr-2" />
          新增记录
        </Button>
      </div>

      <div className="absolute top-20 bottom-0 right-2 flex left-4">
        <div className="overflow-y-auto flex-1 pr-2 overflow-x-hidden">
          {(entryDataQuery?.data?.data?.list || [])?.map((item: any, index: number) => {
            return (
              <div
                key={item._id}
                className={clsx(
                  "border p-2 rounded-md relative group hover:border-green-600 hover:shadow-md",
                  {
                    "border-green-600 shadow-md": currentData?._id === item._id,
                    "mb-6": index !== entryDataQuery?.data?.data?.list.length - 1,
                  },
                )}
                onClick={() => {
                  setCurrentData(item);
                }}
              >
                <div
                  className={clsx(" absolute right-2 top-2  group-hover:block z-50 ", {
                    hidden: currentData?._id !== item._id,
                  })}
                >
                  <Button
                    size="xs"
                    px="2"
                    className="mr-2 w-16"
                    onClick={() => {
                      setCurrentData(item);
                    }}
                  >
                    Edit
                  </Button>
                  <DeleteButton data={item} />
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
                  showSuccess("保存成功");
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
