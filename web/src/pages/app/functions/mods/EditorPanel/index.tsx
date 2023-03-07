import { HStack, Input } from "@chakra-ui/react";
import { t } from "i18next";

import CopyText from "@/components/CopyText";
import FunctionEditor from "@/components/Editor/FunctionEditor";
import EmptyBox from "@/components/EmptyBox";
import Panel from "@/components/Panel";

import { useFunctionListQuery } from "../../service";
import useFunctionStore from "../../store";
import DeployButton from "../DeployButton";
import CreateModal from "../FunctionPanel/CreateModal";

import FunctionDetailPopOver from "./FunctionDetailPopOver";

import useFunctionCache from "@/hooks/useFunctionCache";

function EditorPanel() {
  const store = useFunctionStore((store) => store);
  const { currentFunction, updateFunctionCode, getFunctionUrl } = store;

  const functionCache = useFunctionCache();

  const functionListQuery = useFunctionListQuery();

  return (
    <Panel className="flex-1 flex-grow px-0">
      {currentFunction?.name ? (
        <Panel.Header style={{ borderBottom: "2px solid #F4F6F8" }} className="!mb-3 h-[50px] px-2">
          <HStack maxW={"60%"} spacing={2}>
            <CopyText className="font-bold text-xl" text={currentFunction?.name}>
              <span>{currentFunction?.name}</span>
            </CopyText>
            <FunctionDetailPopOver />
            {currentFunction?.id &&
              functionCache.getCache(currentFunction?.id, currentFunction?.source?.code) !==
                currentFunction?.source?.code && (
                <span className="flex-none inline-block w-2 h-2 rounded-full bg-warn-700"></span>
              )}
            {currentFunction?.desc ? (
              <span className="text-slate-400 font-normal whitespace-nowrap overflow-hidden">
                {currentFunction?.desc}
              </span>
            ) : null}
          </HStack>

          <HStack spacing={1}>
            <CopyText text={getFunctionUrl()}>
              <Input minW={"260px"} size="sm" readOnly value={getFunctionUrl()} />
            </CopyText>

            <DeployButton />
          </HStack>
        </Panel.Header>
      ) : null}

      {!functionListQuery.isFetching && functionListQuery.data?.data?.length === 0 && (
        <EmptyBox>
          <div>
            {t("FunctionPanel.EmptyText")}
            <CreateModal key="create_modal_new">
              <span className="ml-2 text-primary-600 hover:border-b-2 hover:border-primary-600 cursor-pointer">
                {t("CreateNow")}
              </span>
            </CreateModal>
          </div>
        </EmptyBox>
      )}

      {currentFunction?.name && (
        <FunctionEditor
          className="flex-grow"
          path={currentFunction?.id || ""}
          value={functionCache.getCache(currentFunction!.id, currentFunction!.source?.code)}
          onChange={(value) => {
            updateFunctionCode(currentFunction, value || "");
            functionCache.setCache(currentFunction!.id, value || "");
          }}
        />
      )}
    </Panel>
  );
}

export default EditorPanel;
