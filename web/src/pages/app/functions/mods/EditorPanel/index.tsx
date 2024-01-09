import { useTranslation } from "react-i18next";
import { useColorMode } from "@chakra-ui/react";

import FunctionEditor from "@/components/Editor/FunctionEditor";
import TSEditor from "@/components/Editor/TSEditor";
import EmptyBox from "@/components/EmptyBox";
import Panel from "@/components/Panel";
import { RUNTIMES_PATH } from "@/constants";

import { useFunctionListQuery } from "../../service";
import useFunctionStore from "../../store";
import CreateModal from "../FunctionPanel/CreateModal";

import "@/components/Editor/index.css";

import useFunctionCache from "@/hooks/useFunctionCache";
import useCustomSettingStore from "@/pages/customSetting";
import useGlobalStore from "@/pages/globalStore";

function EditorPanel() {
  const store = useFunctionStore((store) => store);
  const { currentFunction, updateFunctionCode } = store;
  const { commonSettings } = useCustomSettingStore();
  const { colorMode } = useColorMode();
  const { t } = useTranslation();
  const functionCache = useFunctionCache();
  const { isLSPEffective } = useGlobalStore();

  const functionListQuery = useFunctionListQuery();
  return (
    <Panel className="flex-1 flex-grow !rounded-tl-none !px-0">
      {!functionListQuery.isFetching && functionListQuery.data?.data?.length === 0 && (
        <EmptyBox className="h-full w-full">
          <>
            <div className="flex items-center justify-center">
              <span className="text-[#828289]">{t("NoFunctionYet")}</span>
              <CreateModal key="create_modal_new">
                <u className="ml-2 cursor-pointer text-primary-600">{t("CreateNow")}</u>
              </CreateModal>
            </div>
          </>
        </EmptyBox>
      )}
      <div className={functionListQuery.data?.data?.length !== 0 ? "h-full" : "hidden"}>
        {commonSettings.useLSP && isLSPEffective ? (
          <FunctionEditor
            value={functionCache.getCache(currentFunction!._id, currentFunction!.source?.code)}
            colorMode={colorMode}
            className="h-full flex-grow"
            path={`${RUNTIMES_PATH}/${currentFunction?.name}.ts`}
            onChange={(code, pos) => {
              updateFunctionCode(currentFunction, code || "");
              functionCache.setCache(currentFunction!._id, code || "");
              functionCache.setPositionCache(currentFunction!.name, JSON.stringify(pos));
            }}
            fontSize={commonSettings.fontSize}
          />
        ) : (
          <TSEditor
            value={functionCache.getCache(currentFunction!._id, currentFunction!.source?.code)}
            path={`${RUNTIMES_PATH}/${currentFunction?.name}.ts`}
            onChange={(value) => {
              updateFunctionCode(currentFunction, value || "");
              functionCache.setCache(currentFunction!._id, value || "");
            }}
            fontSize={commonSettings.fontSize}
            colorMode={colorMode}
          />
        )}
      </div>
    </Panel>
  );
}

export default EditorPanel;
