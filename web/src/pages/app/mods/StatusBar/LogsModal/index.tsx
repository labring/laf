import React, { useCallback, useEffect, useRef, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import {
  Button,
  Center,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Select,
  Spinner,
  useDisclosure,
} from "@chakra-ui/react";
import { LogViewer, LogViewerSearch } from "@patternfly/react-log-viewer";
import { useQuery } from "@tanstack/react-query";

import { formatDate } from "@/utils/format";
import { streamFetch } from "@/utils/streamFetch";

import "./index.scss";

import { PodControllerGetContainerNameList, PodControllerGetPodNameList } from "@/apis/v1/apps";
import useCustomSettingStore from "@/pages/customSetting";
import useGlobalStore from "@/pages/globalStore";
import { ContinueIcon, DownIcon, PauseIcon, RefreshIcon } from "@/components/CommonIcon";

export default function LogsModal(props: { children: React.ReactElement }) {
  const { children } = props;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { t } = useTranslation();
  const settingStore = useCustomSettingStore();

  const { currentApp } = useGlobalStore((state) => state);

  const [logs, setLogs] = useState("");
  const [podName, setPodName] = useState("");
  const [containerName, setContainerName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [rowNumber, setRowNumber] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [pausedRowNumber, setPausedRowNumber] = useState(0);

  const [renderLogs, setRenderLogs] = useState("");
  const [refresh, setRefresh] = useState(true);

  useEffect(() => {
    if (!isPaused) {
      setRenderLogs(logs);
    }
  }, [isPaused, logs]);

  const { data: podData } = useQuery(
    ["GetPodQuery"],
    () => {
      return PodControllerGetPodNameList({});
    },
    {
      onSuccess: (data) => {
        if (data.data.podNameList) {
          setPodName(data.data.podNameList[0]);
        }
      },
      enabled: isOpen,
    },
  );

  const { data: containerData } = useQuery(
    ["GetContainerQuery"],
    () => {
      return PodControllerGetContainerNameList({ podName });
    },
    {
      onSuccess: (data) => {
        if (data.data.containerNameList) {
          const length = data.data.containerNameList.length;
          setContainerName(data.data.containerNameList[length - 1]);
        }
      },
      enabled: isOpen && !!podName && podName !== "all",
    },
  );

  const fetchLogs = useCallback(() => {
    if (!podName && !containerName) return;
    const controller = new AbortController();
    streamFetch({
      url: `/v1/apps/${currentApp.appid}/logs/${podName}?containerName=${containerName}`,
      abortSignal: controller,
      firstResponse() {
        setIsLoading(false);
      },
      onMessage(text) {
        const regex = /id:\s\d+\s+data:\s(.*)\s+data:/g;
        const logs = [...text.matchAll(regex)];
        const regexTime = /(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z)/g;

        const logStr = logs
          .map((log) =>
            log[1].replace(regexTime, (str) => formatDate(str, "YYYY-MM-DD HH:mm:ss.SSS")),
          )
          .join("\n");

        setRowNumber((pre) => pre + logs.length);
        setLogs((pre) => pre + logStr + "\n");
      },
    }).catch((e) => {
      if (e.includes("BodyStreamBuffer was aborted")) {
        return;
      }
      throw e;
    });
    return controller;
  }, [podName, containerName, currentApp.appid]);

  useEffect(() => {
    if (!isOpen) return;
    setLogs("");
    setIsLoading(true);
    const controller = fetchLogs();
    return () => {
      controller?.abort();
    };
  }, [podName, containerName, isOpen, refresh]);

  document.addEventListener('wheel', event => {
    if (event.deltaY < 0 && !isPaused) {
      setIsPaused(true);
      setPausedRowNumber(rowNumber);
    }
  });

  return (
    <>
      {React.cloneElement(children, {
        onClick: () => {
          onOpen();
        },
      })}
      <Modal isOpen={isOpen} onClose={onClose} size={"6xl"}>
        <ModalOverlay />
        <ModalContent className="h-[90vh]" m={"auto"}>
          <ModalHeader>
            <ModalCloseButton />
            <HStack>
              <span>{t("Logs.PodLogs")}</span>
              <span>
                <Select
                  className="ml-4 !h-8 !w-64"
                  onChange={(e) => {
                    setPodName(e.target.value);
                    setIsLoading(true);
                    setLogs("");
                  }}
                  value={podName}
                >
                  {podData?.data?.podNameList &&
                    (podData?.data?.podNameList.length > 1
                      ? ["all", ...podData?.data?.podNameList]
                      : podData?.data?.podNameList
                    ).map((item: string) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                </Select>
              </span>
              {containerData?.data?.containerNameList && (
                <span>
                  <Select
                    className="ml-1 !h-8 !w-32"
                    onChange={(e) => {
                      setContainerName(e.target.value);
                      setIsLoading(true);
                      setLogs("");
                    }}
                    value={containerName}
                  >
                    {...containerData?.data?.containerNameList.map((item: string) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </Select>
                </span>
              )}
              <span>
                <Button
                  variant={"text"}
                  leftIcon={<RefreshIcon boxSize={5} />}
                  px={2}
                  onClick={() => {
                    setRefresh((pre) => !pre);
                    setIsPaused(false);
                  }}
                >
                  {t("Refresh")}
                </Button>
              </span>
              <span>
                <Button
                  leftIcon={isPaused ? <ContinueIcon boxSize={3} width={5} /> : <PauseIcon boxSize={5} />}
                  variant={"text"}
                  px={2}
                  onClick={() => {
                    setIsPaused((pre) => !pre);
                    setPausedRowNumber(rowNumber);
                  }}
                >
                  {isPaused ? t("Logs.Resume") : t("Logs.Pause")}
                </Button>
              </span>
            </HStack>
          </ModalHeader>
          <ModalBody pr={0} py={0}>
            {isLoading ? (
              <Center className="h-full w-full">
                <Spinner />
              </Center>
            ) : (
              <div
                id="log-viewer-container"
                className="text-sm flex flex-col overflow-y-auto px-2 font-mono h-full"
                style={{ fontSize: settingStore.commonSettings.fontSize - 1 }}
              >
                <LogViewer
                  data={renderLogs}
                  hasLineNumbers={false}
                  scrollToRow={isPaused ? pausedRowNumber : rowNumber + 1}
                  height={"98%"}
                  toolbar={
                    <div className="absolute right-24 top-4">
                      <LogViewerSearch
                        placeholder="Search"
                        minSearchChars={1}
                        className="mr-4 h-8 rounded-lg border pl-4 !text-grayModern-400"
                      />
                    </div>
                  }
                />
                <div className="w-[95%] absolute bottom-1">
                  {isPaused && (
                    <Button
                      onClick={() => { setIsPaused(false) }}
                      className="w-full !bg-none backdrop-blur-sm"
                      leftIcon={<DownIcon color={'#33BAB1'} size={24} />}
                      variant={"text"}
                    >
                      {t("Logs.RowToBottom")}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
