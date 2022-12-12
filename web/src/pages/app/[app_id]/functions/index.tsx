/****************************
 * cloud functions index page
 ***************************/

import React from "react";
import { Badge, Button, Center, HStack } from "@chakra-ui/react";
import useHotKey from "hooks/useHotKey";
import useGlobalStore from "@/pages/globalStore";

import CopyText from "@/components/CopyText";
import FunctionEditor from "@/components/Editor/FunctionEditor";
import FileTypeIcon, { FileType } from "@/components/FileTypeIcon";
import PanelHeader from "@/components/Panel/Header";

import LeftPanel from "../mods/LeftPanel";
import RightPanel from "../mods/RightPanel";

import DebugPanel from "./mods/DebugPannel";
import DependecyPanel from "./mods/DependecePanel";
import FunctionPanel from "./mods/FunctionPanel";
import { useUpdateFunctionMutation } from "./service";

import useFunctionStore from "./store";

function FunctionPage() {
  const store = useFunctionStore((store) => store);
  const { currentFunction, functionCodes } = store;

  const { currentApp, showSuccess } = useGlobalStore((state) => state);

  const updateFunctionMutation = useUpdateFunctionMutation();

  useHotKey("s", async () => {
    const res = await updateFunctionMutation.mutateAsync({
      description: currentFunction?.desc,
      code: functionCodes[currentFunction?.id || ""],
      methods: currentFunction?.methods,
      websocket: currentFunction?.websocket,
      name: currentFunction?.name,
    });
    if (!res.error) {
      store.setCurrentFunction(res.data);
      store.updateFunctionCode(res.data, res.data.source.code);
      showSuccess("saved successfully");
    }
  });

  useHotKey("r", () => {
    showSuccess("running success");
  });

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
                {currentFunction?.name}
                <span className="ml-2 text-slate-400 font-normal">
                  {currentFunction?.desc ? currentFunction?.desc : ""}
                </span>
              </span>
              <span className="ml-4 ">
                {functionCodes[currentFunction?.id || ""] &&
                  functionCodes[currentFunction?.id || ""] !== currentFunction?.source.code && (
                    <Badge colorScheme="purple">Editting...</Badge>
                  )}
                {/* <FileStatusIcon status={FileStatus.deleted} /> */}
              </span>
            </div>

            <HStack spacing="4">
              <span>
                <span className=" text-slate-500">调用地址：</span>
                <span className="mr-2">{store.getFunctionUrl()}</span>
                <CopyText text={store.getFunctionUrl()} />
              </span>
              <Button
                size="sm"
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
            {currentFunction?.name ? (
              <FunctionEditor
                path={currentFunction?.name || ""}
                value={functionCodes[currentFunction.id] || currentFunction.source.code}
                onChange={(value) => {
                  store.updateFunctionCode(currentFunction, value || "");
                }}
              />
            ) : (
              <Center className="h-full">请创建函数</Center>
            )}
          </div>
          <div style={{ width: 550 }}>
            {/* <div className="h-full border bg-black">1</div> */}
            <DebugPanel />
          </div>
        </div>
      </RightPanel>
    </>
  );
}

export default FunctionPage;
