import React, { useState } from "react";
import {
  Badge,
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { ApplicationsControllerFindOne } from "services/v1/applications";

import { formatDate } from "@/utils/format";

export default function StatusBadge(props: { statusConditions: any[]; appid: string }) {
  const { appid } = props;
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [statusConditions, setStatusConditions] = useState<any[]>(props.statusConditions);

  const latestStatus = statusConditions.at(-1);

  const queryAppDetail = useQuery(
    ["queryAppDetail", appid],
    async () => {
      const res = await ApplicationsControllerFindOne({ appid });
      return res.data;
    },
    {
      enabled: latestStatus.type !== "Ready",
      refetchInterval: latestStatus.type !== "Ready" ? 1000 : false,
      onSuccess: (res) => {
        setStatusConditions(res.status.conditions);
      },
    },
  );

  return (
    <div>
      <div onClick={onOpen} className="flex items-center cursor-pointer">
        状态:
        <Badge className="ml-2" colorScheme={latestStatus.type === "Ready" ? "green" : "blue"}>
          {latestStatus.type}
        </Badge>
      </div>

      <Modal isOpen={isOpen} onClose={onClose} size="2xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>启动状态</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <ul>
              {(statusConditions || []).map((status: any) => {
                return (
                  <li className="mb-3" key={status.type}>
                    <span className=" text-slate-700 mr-3">
                      {formatDate(status.lastTransitionTime, "YYYY-MM-DD HH:mm:ss")}
                    </span>{" "}
                    {status.message}
                  </li>
                );
              })}
              {queryAppDetail.isFetching ? (
                <li>正在启动中...</li>
              ) : (
                <li className=" text-green-600">启动完成!</li>
              )}
            </ul>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="primary" onClick={onClose}>
              确定
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
