import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Box,
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
import { useQuery } from "@tanstack/react-query";
import { AnsiUp } from "ansi_up";

import { streamFetch } from "@/utils/streamFetch";

import { PodControllerGet } from "@/apis/v1/apps";
import useGlobalStore from "@/pages/globalStore";

export default function LogsModal(props: { children: React.ReactElement }) {
  const { children } = props;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { t } = useTranslation();

  const { currentApp } = useGlobalStore((state) => state);

  const [logs, setLogs] = useState("");
  const [podName, setPodName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const LogBox = useRef<HTMLDivElement>(null);
  const ansi_up = useRef(new AnsiUp());

  const { data: podData } = useQuery(
    ["GetPodQuery"],
    () => {
      return PodControllerGet({});
    },
    {
      onSuccess: (data) => {
        setPodName(data.data.pods[0]);
      },
    },
  );

  const watchLogs = useCallback(() => {
    // podName is empty. pod may  has been deleted
    if (!podName) return;

    const controller = new AbortController();

    streamFetch({
      url: `/v1/apps/${currentApp.appid}/logs/${podName}`,
      abortSignal: controller,
      firstResponse() {
        setIsLoading(false);
        setTimeout(() => {
          if (!LogBox.current) return;

          LogBox.current.scrollTo({
            top: LogBox.current.scrollHeight,
          });
        }, 500);
      },
      onMessage(text) {
        const regex = /id:\s+\d+|data:\s+/g;
        const resultText = text.replace(regex, "");
        setLogs((pre) => {
          return pre + ansi_up.current.ansi_to_html(resultText);
        });

        setTimeout(() => {
          if (!LogBox.current) return;
          const isBottom =
            LogBox.current.scrollTop === 0 ||
            LogBox.current.scrollTop + LogBox.current.clientHeight + 200 >=
              LogBox.current.scrollHeight;

          isBottom &&
            LogBox.current.scrollTo({
              top: LogBox.current.scrollHeight,
            });
        }, 100);
      },
    });
    return controller;
  }, [currentApp.appid, podName]);

  useEffect(() => {
    const controller = watchLogs();
    return () => {
      controller?.abort();
    };
  }, [watchLogs]);

  return (
    <>
      {React.cloneElement(children, {
        onClick: () => {
          onOpen();
        },
      })}
      <Modal isOpen={isOpen} onClose={onClose} size={"6xl"}>
        <ModalOverlay />
        <ModalContent className="h-[90vh]" px={0} m={"auto"}>
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
                >
                  {podData?.data?.pods &&
                    podData?.data?.pods.map((item: string) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                </Select>
              </span>
            </HStack>
          </ModalHeader>
          <ModalBody px={0} py={0}>
            {isLoading ? (
              <Center className="h-full w-full">
                <Spinner />
              </Center>
            ) : (
              <Box flex={"1 0 0"} h={"78vh"} position={"relative"} overflow={"auto"}>
                <Box
                  ref={LogBox}
                  h={"100%"}
                  whiteSpace={"pre"}
                  px={4}
                  overflow={"auto"}
                  fontSize={"13px"}
                  fontWeight={400}
                  lineHeight={"10px"}
                  fontFamily={"SFMono-Regular,Menlo,Monaco,Consolas,monospace"}
                  dangerouslySetInnerHTML={{ __html: logs }}
                ></Box>
              </Box>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
