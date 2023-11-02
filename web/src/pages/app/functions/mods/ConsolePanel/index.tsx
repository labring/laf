import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { LogViewer } from "@patternfly/react-log-viewer";

import CopyText from "@/components/CopyText";
import EmptyBox from "@/components/EmptyBox";
import Panel from "@/components/Panel";

import useFunctionStore from "../../store";

function ConsolePanel() {
  const { t } = useTranslation();
  const { currentRequestId, currentFuncLogs, currentFuncTimeUsage } = useFunctionStore();
  const strArray = useMemo(() => {
    if (!currentFuncLogs) return [""];
    return JSON.parse(decodeURIComponent(currentFuncLogs));
  }, [currentFuncLogs]);

  return (
    <Panel className="flex-1">
      <Panel.Header title="Console" pageId="functionPage" panelId="ConsolePanel"></Panel.Header>
      <div
        className="text-sm relative flex flex-col overflow-y-auto px-2 font-mono"
        style={{ height: "100%" }}
      >
        {strArray && strArray[0] !== "" ? (
          <LogViewer
            data={strArray}
            hasLineNumbers={false}
            height={"100%"}
            header={
              <p className="flex w-full justify-between">
                <span className="mb-1 ml-1">
                  RequestID: {currentRequestId} <CopyText text={String(currentRequestId)} />
                </span>
                <span className="mb-1 ml-1 text-grayModern-400">
                  Time-Usage: {currentFuncTimeUsage}ms
                </span>
              </p>
            }
            scrollToRow={10000}
          />
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
