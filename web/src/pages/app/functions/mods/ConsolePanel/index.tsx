import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import CopyText from "@/components/CopyText";
import EmptyBox from "@/components/EmptyBox";
import Panel from "@/components/Panel";

import useFunctionStore from "../../store";

function ConsolePanel() {
  const { currentRequestId, currentFuncLogs, currentFuncTimeUsage } = useFunctionStore();
  const { t } = useTranslation();
  const stringArray = useMemo(() => {
    if (!currentFuncLogs) return [""];
    return currentFuncLogs?.split(",") || [];
  }, [currentFuncLogs]);

  if (stringArray) {
    stringArray[0] = stringArray[0].replace(/^\[/, "");
    stringArray[stringArray.length - 1] = stringArray[stringArray.length - 1].replace(/\]$/, "");
  }

  return (
    <Panel className="flex-1">
      <Panel.Header title="Console" pageId="functionPage" panelId="ConsolePanel"></Panel.Header>
      <div
        className="text-sm relative flex flex-col overflow-y-auto px-2 font-mono"
        style={{ height: "100%" }}
      >
        {currentRequestId && (
          <p className="flex w-full justify-between">
            <span className="mb-1 ml-1">
              RequestID: {currentRequestId} <CopyText text={String(currentRequestId)} />
            </span>
            <span className="mb-1 ml-1 text-grayModern-400">
              Time-Usage: {currentFuncTimeUsage}ms
            </span>
          </p>
        )}
        {stringArray && stringArray[0] !== "" ? (
          <div className="flex flex-col">
            {stringArray.map((item) => {
              const log = item.slice(1, -1);
              return <span>{log}</span>;
            })}
          </div>
        ) : (
          <EmptyBox hideIcon>
            <span>{t("NoInfo")}</span>
          </EmptyBox>
        )}
      </div>
    </Panel>
  );
}

export default ConsolePanel;
