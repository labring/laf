/****************************
 * cloud functions index page
 ***************************/

import React, { useCallback, useEffect } from "react";
import { Button, HStack } from "@chakra-ui/react";
import useHotKey from "hooks/useHotKey";

import FunctionEditor from "@/components/Editor/FunctionEditor";
import FileStatusIcon, { FileStatus } from "@/components/FileStatusIcon";
import FileTypeIcon, { FileType } from "@/components/FileTypeIcon";
import PanelHeader from "@/components/Panel/Header";

import DebugPanel from "./mods/DebugPannel";
import DependecyPanel from "./mods/DependecePanel";
import FunctionPanel from "./mods/FunctionPanel";

import useFunctionStore from "./store";

function FunctionPage() {
  const { initFunctionPage, currentFunction } = useFunctionStore((store) => store);

  useHotKey("s", () => {
    console.log("save");
  });

  useHotKey("r", () => {
    console.log("run");
  });

  useEffect(() => {
    initFunctionPage();

    return () => {};
  }, [initFunctionPage]);

  return (
    <>
      <div
        className="border-r bg-slate-50 border-r-slate-300"
        style={{ minWidth: 300, maxWidth: 300 }}
      >
        <FunctionPanel />
        <DependecyPanel />
      </div>
      <div className="flex flex-1 flex-col ">
        <div className="border-b" style={{ height: 36 }}>
          <PanelHeader>
            <div className="flex items-center">
              <FileTypeIcon type={FileType.js} />
              <span className="font-bold text-base ml-2">
                {currentFunction?.label} &nbsp;({currentFunction?.name}.js)
              </span>
              <span className="ml-4 ">
                <FileStatusIcon status={FileStatus.deleted} />
              </span>
            </div>

            <HStack spacing="4">
              <span>
                <span className=" text-slate-500">调用地址：</span>
                <span>https://qcphsd.api.cloudendpoint.cn/deleteCurrentTodo</span>
              </span>
              <Button
                size="xs"
                borderRadius={2}
                colorScheme="primary"
                padding="0 12px"
                onClick={() => {
                  console.log("发布");
                }}
              >
                发布
              </Button>
            </HStack>
          </PanelHeader>
        </div>
        <div className="flex flex-row h-full">
          <div className="flex-1 border-r border-r-slate-200">
            <FunctionEditor value={currentFunction?.code || ""} />
          </div>
          <div style={{ width: 550 }}>
            <DebugPanel />
          </div>
        </div>
      </div>
    </>
  );
}

export default FunctionPage;
