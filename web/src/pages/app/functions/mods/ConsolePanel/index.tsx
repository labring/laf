import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { LogViewer } from "@patternfly/react-log-viewer";

import CopyText from "@/components/CopyText";
import EmptyBox from "@/components/EmptyBox";
import Panel from "@/components/Panel";
import { formatDate } from "@/utils/format";
import { decodeData } from "@/utils/handleData";

import useFunctionStore from "../../store";

import useCustomSettingStore from "@/pages/customSetting";

function ConsolePanel() {
  const { t } = useTranslation();
  const { currentRequestId, currentFuncLogs, currentFuncTimeUsage } = useFunctionStore();
  const logsArray = useMemo(() => {
    if (!currentFuncLogs) return [""];
    const strArray = JSON.parse(decodeData(currentFuncLogs));
    const regex = /(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z)/;
    return strArray.map((item: string) => {
      const match = item.match(regex);
      if (match) {
        const newTimeStr = formatDate(match[1], "YYYY-MM-DD HH:mm:ss.SSS");
        return item.replace(match[1], newTimeStr);
      } else {
        return item;
      }
    });
  }, [currentFuncLogs]);
  const { commonSettings } = useCustomSettingStore();

  return (
    <Panel className="flex-1">
      <Panel.Header title="Console" pageId="functionPage" panelId="ConsolePanel"></Panel.Header>
      <div
        className="text-sm relative flex flex-col overflow-y-auto px-2 font-mono"
        style={{ height: "100%", fontSize: commonSettings.fontSize - 1 }}
      >
        {logsArray && logsArray[0] !== "" ? (
          <LogViewer
            data={logsArray}
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
