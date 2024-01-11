import { useState } from "react";
import React from "react";
import { AddIcon, Search2Icon } from "@chakra-ui/icons";
import {
  Button,
  Center,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useColorMode,
  useDisclosure,
} from "@chakra-ui/react";
import { t } from "i18next";

import { RecycleDeleteIcon } from "@/components/CommonIcon";
import ConfirmButton from "@/components/ConfirmButton";
import EmptyBox from "@/components/EmptyBox";
import IconWrap from "@/components/IconWrap";
import { formatDate } from "@/utils/format";

import AddTriggerModal from "./AddTriggerModal";
import { useDeleteTriggerMutation, useTriggerListQuery } from "./service";

export default function TriggerModal(props: { children: React.ReactElement }) {
  const [searchKey, setSearchKey] = useState<string>("");
  const triggerListQuery = useTriggerListQuery(() => {});
  const deleteTriggerMutation = useDeleteTriggerMutation(() => {
    triggerListQuery.refetch();
  });

  const { isOpen, onOpen, onClose } = useDisclosure();
  const darkMode = useColorMode().colorMode === "dark";

  return (
    <>
      {React.cloneElement(props.children, {
        onClick: () => {
          onOpen();
          triggerListQuery.refetch();
        },
      })}

      <Modal isOpen={isOpen} onClose={onClose} size="4xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t("TriggerPanel.Trigger")}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <div className="flex">
              <AddTriggerModal>
                <Button colorScheme="primary" leftIcon={<AddIcon />}>
                  {t("TriggerPanel.AddTrigger")}
                </Button>
              </AddTriggerModal>
              <InputGroup className="ml-4" width={"35%"}>
                <InputLeftElement
                  height={"8"}
                  left="2"
                  pointerEvents="none"
                  children={<Search2Icon color="gray.300" fontSize={12} />}
                />
                <Input
                  rounded={"full"}
                  placeholder={t("TriggerPanel.SearchTip").toString()}
                  size={"sm"}
                  onChange={(e) => setSearchKey(e.target.value)}
                />
              </InputGroup>
            </div>
            <div className="relative mt-4 h-[450px] overflow-y-auto rounded-md">
              {!triggerListQuery.isFetching ? (
                <div className="mb-4">
                  {triggerListQuery.data?.data?.length ? (
                    <TableContainer>
                      <Table variant="simple">
                        <Thead className={darkMode ? "" : "bg-lafWhite-300"}>
                          <Tr>
                            <Th borderTopLeftRadius={"10px"} borderBottomLeftRadius={"10px"}>
                              {t("TriggerPanel.Name")}
                            </Th>
                            <Th>{t("TriggerPanel.Function")}</Th>
                            <Th>{t("TriggerPanel.Type")}</Th>
                            <Th>{t("TriggerPanel.Cron")}</Th>
                            <Th>{t("TriggerPanel.Time")}</Th>
                            <Th borderTopRightRadius={"10px"} borderBottomRightRadius={"10px"}>
                              {t("Operation")}
                            </Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {triggerListQuery.data?.data
                            .filter((item: any) => {
                              return item.desc.indexOf(searchKey) > -1;
                            })
                            .map((item: any) => (
                              <Tr key={item._id} className={darkMode ? "" : "bg-lafWhite-300"}>
                                <Td borderTopLeftRadius={"10px"} borderBottomLeftRadius={"10px"}>
                                  <span>{item.desc}</span>
                                </Td>
                                <Td>
                                  <span>{item.target}</span>
                                </Td>
                                <Td>
                                  <span>{t("TriggerPanel.SetTimeout")}</span>
                                </Td>
                                <Td>
                                  <span>{item.cron}</span>
                                </Td>
                                <Td className="text-slate-500" maxWidth="5rem">
                                  {formatDate(item.updatedAt)}
                                </Td>
                                <Td borderTopRightRadius={"10px"} borderBottomRightRadius={"10px"}>
                                  <HStack spacing={1}>
                                    <ConfirmButton
                                      onSuccessAction={() =>
                                        deleteTriggerMutation.mutate({ id: item._id })
                                      }
                                      headerText={String(t("Delete"))}
                                      bodyText={t("TriggerPanel.DeleteConfirm")}
                                    >
                                      <IconWrap tooltip={String(t("Delete"))}>
                                        <RecycleDeleteIcon fontSize={15} />
                                      </IconWrap>
                                    </ConfirmButton>
                                  </HStack>
                                </Td>
                              </Tr>
                            ))}
                        </Tbody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <EmptyBox className="min-h-[400px]">
                      <div>
                        <span>{t("TriggerPanel.EmptyTriggerTip")}</span>
                        <AddTriggerModal>
                          <span className="ml-2 cursor-pointer text-primary-600 hover:border-b-2 hover:border-primary-600">
                            {t("CreateNow")}
                          </span>
                        </AddTriggerModal>
                      </div>
                    </EmptyBox>
                  )}
                </div>
              ) : (
                <Center className="h-full">
                  <Spinner />
                </Center>
              )}
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
