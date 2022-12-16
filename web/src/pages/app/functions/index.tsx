/****************************
 * cloud functions index page
 ***************************/

import { useState } from "react";
import { Badge, Button, Center, HStack } from "@chakra-ui/react";
import { t } from "i18next";

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

import useFunctionCache from "@/hooks/useFuncitonCache";
import useHotKey from "@/hooks/useHotKey";
import useGlobalStore from "@/pages/globalStore";

function FunctionPage() {
  const store = useFunctionStore((store) => store);
  const { currentFunction, updateFunctionCode, functionCodes } = store;

  const functionCache = useFunctionCache();

  const { showSuccess } = useGlobalStore((state) => state);

  const updateFunctionMutation = useUpdateFunctionMutation();

  const [localSaved, setLocalSaved] = useState(false);

  const deploy = async () => {
    const res = await updateFunctionMutation.mutateAsync({
      description: currentFunction?.desc,
      code: functionCache.getCache(currentFunction!.id),
      methods: currentFunction?.methods,
      websocket: currentFunction?.websocket,
      name: currentFunction?.name,
    });
    if (!res.error) {
      store.setCurrentFunction(res.data);
      // delete cache after deploy
      functionCache.removeCache(currentFunction!.id);
      showSuccess("deployed successfully");
    }
  };

  useHotKey("p", async () => {
    deploy();
  });

  useHotKey("s", async () => {
    setLocalSaved(true);
    functionCache.setCache(currentFunction!.id, functionCodes[currentFunction!.id]);
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
                    {localSaved ? (
                      <div>
                        <Badge colorScheme="gray" className="mr-2">
                          {t("LocalSaved...")}
                        </Badge>
                        <span className="ml-2 text-slate-500 text-sm">{t("LocalSavedTip")}</span>
                      </div>
                    ) : (
                      currentFunction?.id &&
                      functionCache.getCache(currentFunction?.id) !==
                        currentFunction?.source?.code && (
                        <div>
                          <Badge colorScheme="purple">{t("Editting...")}</Badge>{" "}
                        </div>
                      )
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

                  <Button
                    size="sm"
                    borderRadius={4}
                    disabled={store.getFunctionUrl() === ""}
                    colorScheme="blue"
                    padding="0 12px"
                    onClick={() => {
                      deploy();
                    }}
                  >
                    {t("FunctionPanel.Deploy")} (⌘ + P)
                  </Button>
                </HStack>
              </PanelHeader>
            </div>
            {currentFunction?.name ? (
              <FunctionEditor
                path={currentFunction?.name || ""}
                value={functionCache.getCache(currentFunction!.id)}
                onChange={(value) => {
                  setLocalSaved(false);
                  updateFunctionCode(currentFunction, value || "");
                  // functionCache.setCache(currentFunction!.id, value || "");
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
