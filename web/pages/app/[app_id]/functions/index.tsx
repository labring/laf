/****************************
 * cloud functions index page
 ***************************/

import React, { useCallback, useEffect } from "react";
import { Button, HStack } from "@chakra-ui/react";
import useHotKey from "hooks/useHotKey";
import useGlobalStore from "pages/globalStore";

import CopyText from "@/components/CopyText";
import FunctionEditor from "@/components/Editor/FunctionEditor";
import FileStatusIcon, { FileStatus } from "@/components/FileStatusIcon";
import FileTypeIcon, { FileType } from "@/components/FileTypeIcon";
import PanelHeader from "@/components/Panel/Header";

import LeftPanel from "../mods/LeftPanel";
import RightPanel from "../mods/RightPanel";

import DebugPanel from "./mods/DebugPannel";
import DependecyPanel from "./mods/DependecePanel";
import FunctionPanel from "./mods/FunctionPanel";

import useFunctionStore from "./store";

function FunctionPage() {
  const { initFunctionPage, currentFunction } = useFunctionStore((store) => store);

  const { showSuccess } = useGlobalStore((state) => state);

  useHotKey("s", () => {
    showSuccess("saved successfully");
  });

  useHotKey("r", () => {
    showSuccess("it's running");
  });

  useEffect(() => {
    initFunctionPage();

    return () => {};
  }, [initFunctionPage]);

  return (
    <>
      <LeftPanel>
        <FunctionPanel />
        <DependecyPanel />
      </LeftPanel>
      <RightPanel>
        <div className="border-b" style={{ height: 36 }}>
          <PanelHeader>
            <div className="flex items-center">
              <FileTypeIcon type={FileType.js} />
              <span className="font-bold text-base ml-2">
                {currentFunction?.metadata.name} &nbsp;({currentFunction?.spec.description})
              </span>
              <span className="ml-4 ">
                <FileStatusIcon status={FileStatus.deleted} />
              </span>
            </div>

            <HStack spacing="4">
              <span>
                <span className=" text-slate-500">调用地址：</span>
                <span className="mr-2">https://qcphsd.api.cloudendpoint.cn/deleteCurrentTodo</span>
                <CopyText text="https://qcphsd.api.cloudendpoint.cn/deleteCurrentTodo" />
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
        <div className="flex flex-row h-full w-full">
          <div className="flex-1 border-r border-r-slate-200 overflow-hidden ">
            <FunctionEditor value={currentFunction?.spec.source.codes || ""} />
          </div>
          <div style={{ width: 550 }}>
            <DebugPanel />
          </div>
        </div>
      </RightPanel>
    </>
  );
}

export default FunctionPage;
