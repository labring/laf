import { Center, Spinner } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { t } from "i18next";

import CopyText from "@/components/CopyText";
import EmptyBox from "@/components/EmptyBox";
import Panel from "@/components/Panel";
import { formatDate } from "@/utils/format";

import useFunctionStore from "../../store";

import { LogControllerGetLogs } from "@/apis/v1/apps";

function ConsolePanel() {
  const { currentRequestId } = useFunctionStore();

  const logControllerGetLogsQuery = useQuery(
    ["LogControllerGetLogs", currentRequestId],
    () => {
      return LogControllerGetLogs({ requestId: currentRequestId, limit: 100 });
    },
    {
      enabled: typeof currentRequestId !== "undefined",
    },
  );

  return (
    <Panel className="flex-1 max-h-[200px]">
      <Panel.Header title="Console"></Panel.Header>
      <div className="relative overflow-y-auto px-2 font-mono text-sm " style={{ height: 160 }}>
        {currentRequestId && (
          <p className="mb-1 ml-1">
            RequestID: {currentRequestId} <CopyText text={String(currentRequestId)} />
          </p>
        )}
        {logControllerGetLogsQuery.isFetching ? (
          <Center>
            <Spinner />
          </Center>
        ) : logControllerGetLogsQuery.data?.data?.list?.length ? (
          logControllerGetLogsQuery.data?.data?.list?.reverse().map((item: any) => {
            return (
              <div key={item._id} className="flex ">
                <span className=" text-slate-500 min-w-[160px]">
                  [{formatDate(item.created_at, "YYYY-MM-DD hh:mm:ss")}]
                </span>
                <pre className="flex-1">{item.data}</pre>
              </div>
            );
          })
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
