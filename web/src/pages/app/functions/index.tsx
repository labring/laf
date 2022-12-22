/****************************
 * cloud functions index page
 ***************************/

import { Badge, Center, HStack } from "@chakra-ui/react";
import { t } from "i18next";

import CopyText from "@/components/CopyText";
import FunctionEditor from "@/components/Editor/FunctionEditor";
import FileTypeIcon, { FileType } from "@/components/FileTypeIcon";
import PanelHeader from "@/components/Panel/Header";

import LeftPanel from "../mods/LeftPanel";
import RightPanel from "../mods/RightPanel";

import DebugPanel from "./mods/DebugPannel";
import DependecyPanel from "./mods/DependecePanel";
import DeployButton from "./mods/DeployButton";
import FunctionPanel from "./mods/FunctionPanel";

import useFunctionStore from "./store";

import useFunctionCache from "@/hooks/useFuncitonCache";
import useHotKey from "@/hooks/useHotKey";

console.log(123123);

function FunctionPage() {
  const store = useFunctionStore((store) => store);
  const { currentFunction, updateFunctionCode } = store;

  const functionCache = useFunctionCache();

  useHotKey("s", async () => {
    // showInfo("已开启自动保存");
  });

  return (
    <>
      <LeftPanel>
        <FunctionPanel />
        <DependecyPanel />
      </LeftPanel>
      <RightPanel>
        <div className="flex flex-row h-full w-full">
          <div className="flex-1 border-r border-r-slate-200 overflow-hidden ">
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
                    {currentFunction?.id &&
                      functionCache.getCache(currentFunction?.id) !==
                        currentFunction?.source?.code && (
                        <div>
                          <Badge colorScheme="purple">{t("Editting...")}</Badge>
                        </div>
                      )}

                    {/* <FileStatusIcon status={FileStatus.deleted} /> */}
                  </span>
                </div>

                <HStack spacing="4">
                  {store.getFunctionUrl() !== "" && (
                    <span>
                      <span className=" text-slate-500">调用地址：{store.getFunctionUrl()}</span>
                      <CopyText text={store.getFunctionUrl()} />
                    </span>
                  )}
                  <DeployButton />
                </HStack>
              </PanelHeader>
            </div>
            {currentFunction?.name ? (
              <FunctionEditor
                path={currentFunction?.name || ""}
                value={functionCache.getCache(currentFunction!.id)}
                onChange={(value) => {
                  updateFunctionCode(currentFunction, value || "");
                  functionCache.setCache(currentFunction!.id, value || "");
                }}
              />
            ) : (
              <Center className="h-full">{t("FunctionPanel.EmptyText")}</Center>
            )}
          </div>
          <div style={{ width: "30%" }}>
            {/* <div className="h-full border bg-black">1</div> */}
            <DebugPanel />
          </div>
        </div>
      </RightPanel>
    </>
  );
}

export default FunctionPage;
