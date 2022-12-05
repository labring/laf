/****************************
 * cloud functions index page
 ***************************/

import React, { useCallback, useEffect } from "react";
import { Badge, Button, HStack } from "@chakra-ui/react";
import useHotKey from "hooks/useHotKey";
import useGlobalStore from "pages/globalStore";

import CopyText from "@/components/CopyText";
import FunctionEditor from "@/components/Editor/FunctionEditor";
import FileTypeIcon, { FileType } from "@/components/FileTypeIcon";
import PanelHeader from "@/components/Panel/Header";

import LeftPanel from "../mods/LeftPanel";
import RightPanel from "../mods/RightPanel";

import DebugPanel from "./mods/DebugPannel";
import DependecyPanel from "./mods/DependecePanel";
import FunctionPanel from "./mods/FunctionPanel";

import useFunctionStore from "./store";

function FunctionPage() {
  const {
    initFunctionPage,
    currentFunction,
    setCurrentFunction,
    updateFunction,
    updateFunctionCode,
  } = useFunctionStore((store) => store);

  const { showSuccess } = useGlobalStore((state) => state);

  useHotKey("s", () => {
    showSuccess("saved successfully");
    updateFunction({
      description: currentFunction?.desc,
      code: currentFunction?.source.code,
      methods: currentFunction?.methods,
      websocket: currentFunction?.websocket,
      name: currentFunction?.name,
    });
    setCurrentFunction(
      Object.assign({}, currentFunction, {
        isEdit: false,
      }),
    );
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
                {currentFunction?.name} &nbsp;({currentFunction?.desc})
              </span>
              <span className="ml-4 ">
                {currentFunction?.isEdit && <Badge colorScheme="purple">Editting...</Badge>}
                {/* <FileStatusIcon status={FileStatus.deleted} /> */}
              </span>
            </div>

            <HStack spacing="4">
              <span>
                <span className=" text-slate-500">调用地址：</span>
                <span className="mr-4">
                  https://qcphsd.api.cloudendpoint.cn/{currentFunction?.name}
                </span>
                <CopyText text={`https://qcphsd.api.cloudendpoint.cn/${currentFunction?.name}`} />
              </span>
              <Button
                size="xs"
                borderRadius={2}
                colorScheme="primary"
                padding="0 12px"
                onClick={() => {
                  console.log("发布");
                  console.log(currentFunction?.source.code);
                }}
              >
                发布
              </Button>
            </HStack>
          </PanelHeader>
        </div>
        <div className="flex flex-row h-full w-full">
          <div className="flex-1 border-r border-r-slate-200 overflow-hidden ">
            <FunctionEditor
              path={currentFunction?.name || ""}
              value={currentFunction?.source.code || ""}
              onChange={(value) => {
                console.log(value);
                updateFunctionCode(currentFunction, value || "");
              }}
            />
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
