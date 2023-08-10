import { useTranslation } from "react-i18next";
import { useColorMode } from "@chakra-ui/react";

import FunctionEditor from "@/components/Editor/FunctionEditor";
import EmptyBox from "@/components/EmptyBox";
import Panel from "@/components/Panel";

import { useFunctionListQuery } from "../../service";
import useFunctionStore from "../../store";
import CreateModal from "../FunctionPanel/CreateModal";
import PromptModal from "../FunctionPanel/CreateModal/PromptModal";

import useFunctionCache from "@/hooks/useFunctionCache";

function EditorPanel() {
  const store = useFunctionStore((store) => store);
  const { currentFunction, updateFunctionCode, recentFunctionList } = store;
  const { colorMode } = useColorMode();
  const { t } = useTranslation();
  const functionCache = useFunctionCache();

  const functionListQuery = useFunctionListQuery();
  return (
    <Panel className="flex-1 flex-grow !rounded-tl-none px-0 pt-2">
      {!functionListQuery.isFetching && functionListQuery.data?.data?.length === 0 && (
        <EmptyBox>
          <>
            <div className="flex items-center justify-center">
              <CreateModal key="create_modal_new">
                <span className="ml-2 cursor-pointer border-b-2 border-b-transparent text-primary-600 hover:border-primary-600">
                  {t("CreateNow")}
                </span>
              </CreateModal>

              <p className="mx-2 mb-[2px]">{t("Or")}</p>

              <PromptModal>
                <span className="cursor-pointer border-b-2 border-b-transparent font-bold text-primary-600  hover:border-primary-600">
                  {t("TryLafAI")}
                </span>
              </PromptModal>
            </div>
          </>
        </EmptyBox>
      )}
      {recentFunctionList.length > 0 && currentFunction?.name ? (
        <FunctionEditor
          colorMode={colorMode}
          className="flex-grow"
          style={{
            marginLeft: -14,
            marginRight: -14,
          }}
          path={currentFunction?._id || ""}
          value={functionCache.getCache(currentFunction!._id, currentFunction!.source?.code)}
          onChange={(value) => {
            updateFunctionCode(currentFunction, value || "");
            functionCache.setCache(currentFunction!._id, value || "");
          }}
        />
      ) : (
        functionListQuery.data?.data?.length !== 0 && (
          <EmptyBox>
            <></>
          </EmptyBox>
        )
      )}
    </Panel>
  );
}

export default EditorPanel;
