import { Center, HStack, Input } from "@chakra-ui/react";
import { t } from "i18next";

import CopyText from "@/components/CopyText";
import FunctionEditor from "@/components/Editor/FunctionEditor";
import Panel from "@/components/Panel";

import useFunctionStore from "../../store";
import DeployButton from "../DeployButton";
import CreateModal from "../FunctionPanel/CreateModal";

import useFunctionCache from "@/hooks/useFunctionCache";

function EditorPanel() {
  const store = useFunctionStore((store) => store);
  const { currentFunction, updateFunctionCode, getFunctionUrl } = store;

  const functionCache = useFunctionCache();

  return (
    <Panel className="flex-1 flex-grow">
      {currentFunction?.name ? (
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
              <Badge colorScheme="purple">{t("Editing...")}</Badge>
            </div>
          )} */}

              {/* <FileStatusIcon status={FileStatus.deleted} /> */}
            </span>
          </div>

          <HStack>
            <CopyText className="ml-2" text={getFunctionUrl()}>
              <Input
                size="sm"
                bg="#F1F4F6"
                border="none"
                readOnly
                rounded={4}
                value={getFunctionUrl()}
              />
            </CopyText>

            <DeployButton />
          </HStack>
        </Panel.Header>
      ) : null}

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
        <Center className="h-full">
          {t("FunctionPanel.EmptyText")}
          <CreateModal key="create_modal_new">
            <span className="ml-2 text-blue-500 cursor-pointer">{t("CreateNow")}</span>
          </CreateModal>
        </Center>
      )}
    </Panel>
  );
}

export default EditorPanel;
