/****************************
 * cloud functions index page
 ***************************/

import { Center, HStack, Input } from "@chakra-ui/react";
import { t } from "i18next";

import CopyText from "@/components/CopyText";
import FunctionEditor from "@/components/Editor/FunctionEditor";
import Panel from "@/components/Panel";

import LeftPanel from "../mods/LeftPanel";

import ConsolePanel from "./mods/ConsolePanel";
import DebugPanel from "./mods/DebugPannel";
import DependecyPanel from "./mods/DependecePanel";
import DeployButton from "./mods/DeployButton";
import FunctionPanel from "./mods/FunctionPanel";

import useFunctionStore from "./store";

import useFunctionCache from "@/hooks/useFuncitonCache";

function FunctionPage() {
  const store = useFunctionStore((store) => store);
  const { currentFunction, updateFunctionCode, getFunctionDebugUrl } = store;

  const functionCache = useFunctionCache();

  return (
    <>
      <LeftPanel>
        <FunctionPanel />
        <DependecyPanel />
      </LeftPanel>
      <div className="flex-1 flex flex-col overflow-hidden">
        <Panel className="flex-1">
          <Panel.Header style={{ borderBottom: "2px solid #F4F6F8" }} className="!mb-3">
            <div className="flex items-center h-[50px]">
              <span className="font-bold text-lg ml-2">
                {currentFunction?.name}
                <span className="ml-2 text-slate-400 font-normal">
                  {currentFunction?.desc ? currentFunction?.desc : ""}
                </span>
              </span>
              <span className="ml-4 ">
                {/* {currentFunction?.id &&
                  functionCache.getCache(currentFunction?.id) !== currentFunction?.source?.code && (
                    <div>
                      <Badge colorScheme="purple">{t("Editting...")}</Badge>
                    </div>
                  )} */}

                {/* <FileStatusIcon status={FileStatus.deleted} /> */}
              </span>
            </div>

            <HStack>
              <CopyText className="ml-2" text={getFunctionDebugUrl()}>
                <Input
                  size="sm"
                  bg="#F1F4F6"
                  border="none"
                  readOnly
                  rounded={4}
                  value={getFunctionDebugUrl()}
                />
              </CopyText>

              <DeployButton />
            </HStack>
          </Panel.Header>
          {currentFunction?.name ? (
            <FunctionEditor
              height="calc(100vh - 300px)"
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
        </Panel>

        <ConsolePanel />
      </div>
      <div className="flex-1 flex flex-col" style={{ maxWidth: "30%" }}>
        <DebugPanel />
      </div>
    </>
  );
}

export default FunctionPage;
