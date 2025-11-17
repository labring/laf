import { useCallback, useEffect, useState } from "react";
import { Badge, Center, Spinner, useColorMode } from "@chakra-ui/react";
import { EventStreamContentType, fetchEventSource } from "@microsoft/fetch-event-source";
import { LogViewer } from "@patternfly/react-log-viewer";
import clsx from "clsx";

import "./initLog.scss";

import useGlobalStore from "@/pages/globalStore";

type Log = {
  data: string;
  event: string;
  id: string;
  retry?: number;
};

export default function InitLog() {
  const { currentApp } = useGlobalStore((state) => state);
  const [isLoading, setIsLoading] = useState(true);
  const [rowCount, setRowCount] = useState(0);
  const [paused, setPaused] = useState(false);

  const [logs, setLogs] = useState<Log[]>([]);
  const [renderLogs, setRenderLogs] = useState("");

  const darkMode = useColorMode().colorMode === "dark";

  const addOrUpdateLog = (newLog: Log) => {
    setLogs((pre) => {
      const existingLogIndex = pre.findIndex((existingLog) => existingLog.id === newLog.id);

      if (existingLogIndex !== -1) {
        const updatedLogs = [...pre];
        updatedLogs[existingLogIndex] = {
          ...updatedLogs[existingLogIndex],
          data: newLog.data,
        };
        return updatedLogs;
      } else {
        return [...pre, newLog];
      }
    });
  };

  const fetchLogs = useCallback(() => {
    const ctrl = new AbortController();

    fetchEventSource(`/v1/apps/${currentApp.appid}/logs/all?containerName=init`, {
      method: "GET",
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      signal: ctrl.signal,
      async onopen(response) {
        if (response.ok && response.headers.get("content-type") === EventStreamContentType) {
          setIsLoading(false);
        } else {
          throw new Error(`Unexpected response: ${response.status} ${response.statusText}`);
        }
      },

      onmessage(msg) {
        if (msg.event === "error") {
          throw new Error(msg.data);
        }

        if (msg.event === "log") {
          addOrUpdateLog(msg);
        }
      },

      onclose() {
        throw new Error("connect closed unexpectedly, retrying...");
      },

      onerror(err) {
        // auto retry fetch
      },
    });
    return ctrl;
  }, [currentApp.appid]);

  useEffect(() => {
    setPaused(false);
    setLogs([]);
    setRowCount(0);
    setIsLoading(true);

    const ctrl = fetchLogs();

    return () => {
      ctrl?.abort();
    };
  }, [fetchLogs]);

  useEffect(() => {
    if (logs.length === 0) return;

    const sortedLogs = [...logs].sort((a, b) => parseInt(a.id) - parseInt(b.id));
    const logLines = sortedLogs.flatMap((log) => log.data.split("\n"));
    const filteredLogLines = logLines.filter((line) => line.trim() !== "");
    const uniqueLogLines = Array.from(new Set(filteredLogLines));

    setRenderLogs(uniqueLogLines.join("\n"));
    setRowCount(uniqueLogLines.length);
  }, [logs]);

  return (
    <>
      {isLoading ? (
        <Center className="h-full w-full">
          <Spinner />
        </Center>
      ) : (
        <>
          <div
            id="log-viewer-cover-container"
            className={clsx(
              "absolute inset-0 z-[999] h-full w-full px-2 pt-0 font-mono text-base font-bold opacity-60",
              darkMode ? "bg-lafDark-100" : "bg-lafWhite-600",
              { "log-viewer-cover-container-hide-scrollbar": !paused },
            )}
            style={{ fontSize: 16 }}
          >
            <LogViewer
              data={renderLogs}
              hasLineNumbers={false}
              scrollToRow={paused ? undefined : rowCount + 1}
              height={"100%"}
              onScroll={(e) => {
                if (e.scrollOffsetToBottom <= 5) {
                  setPaused(false);
                  return;
                }
                if (!e.scrollUpdateWasRequested) {
                  setPaused(true);
                  return;
                }
                setPaused(false);
              }}
            />
          </div>
          <div className="absolute inset-0 z-[998] flex flex-col items-center justify-center">
            <Spinner
              thickness="4px"
              speed="0.65s"
              emptyColor="gray.200"
              color="blue.500"
              size="xl"
            />
            <Badge className="mt-4">{currentApp.phase}...</Badge>
          </div>
        </>
      )}
    </>
  );
}
