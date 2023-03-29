import { useTranslation } from "react-i18next";
import { HStack, Input, useColorMode } from "@chakra-ui/react";
import clsx from "clsx";

import CopyText from "@/components/CopyText";
import FunctionEditor from "@/components/Editor/FunctionEditor";
import EmptyBox from "@/components/EmptyBox";
import Panel from "@/components/Panel";

import { useFunctionListQuery } from "../../service";
import useFunctionStore from "../../store";
import DeployButton from "../DeployButton";
import CreateModal from "../FunctionPanel/CreateModal";
import PromptModal from "../FunctionPanel/CreateModal/PromptModal";

import FunctionDetailPopOver from "./FunctionDetailPopOver";

import useFunctionCache from "@/hooks/useFunctionCache";

function EditorPanel() {
  const store = useFunctionStore((store) => store);
  const { currentFunction, updateFunctionCode, getFunctionUrl } = store;
  const { colorMode } = useColorMode();
  const { t } = useTranslation();
  const functionCache = useFunctionCache();

  const functionListQuery = useFunctionListQuery();
  const darkMode = colorMode === "dark";
  return (
    <Panel className="flex-1 flex-grow px-0">
      {currentFunction?.name ? (
        <Panel.Header
          className={clsx("!mb-3 h-[50px] px-2", {
            "border-b-2": !darkMode,
            "border-lafWhite-400": !darkMode,
          })}
        >
          <HStack maxW={"55%"} spacing={2}>
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
              <span className="text-slate-400 font-normal whitespace-nowrap overflow-hidden text-ellipsis">
                {currentFunction?.desc}
              </span>
            ) : null}
          </HStack>

          <HStack spacing={1}>
            <CopyText text={getFunctionUrl()}>
              <Input w={"240px"} size="sm" readOnly value={getFunctionUrl()} />
            </CopyText>

            <DeployButton />
          </HStack>
        </Panel.Header>
      ) : null}

      {!functionListQuery.isFetching && functionListQuery.data?.data?.length === 0 && (
        <EmptyBox>
          <>
            <div className="flex justify-center items-center">
              <CreateModal key="create_modal_new">
                <span className="ml-2 text-primary-600 border-b-2 border-b-transparent hover:border-primary-600 cursor-pointer">
                  {t("CreateNow")}
                </span>
              </CreateModal>

              <p className="mx-2 mb-[2px]">{t("Or")}</p>

              <PromptModal>
                <span className="text-primary-600 font-bold border-b-2 border-b-transparent hover:border-primary-600  cursor-pointer">
                  {t("TryLafAI")}
                </span>
              </PromptModal>
            </div>
          </>
        </EmptyBox>
      )}

      {currentFunction?.name && (
        <FunctionEditor
          colorMode={colorMode}
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
