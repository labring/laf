import { useState } from "react";
import React from "react";
import { AddIcon, DeleteIcon, Search2Icon } from "@chakra-ui/icons";
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
  useDisclosure,
} from "@chakra-ui/react";
import { t } from "i18next";

import ConfirmButton from "@/components/ConfirmButton";
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

  return (
    <>
      {React.cloneElement(props.children, {
        onClick: () => {
          onOpen();
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
            <div className="mt-4 rounded-md h-full relative">
              {triggerListQuery.isFetching ? (
                <Center className="opacity-60 bg-white absolute left-0 right-0 top-0 bottom-0 z-10">
                  <Spinner size={"lg"} />
                </Center>
              ) : null}
              <div className="overflow-y-auto h-full mb-4">
                <TableContainer minH={"400px"}>
                  <Table variant="simple">
                    <Thead>
                      <Tr bgColor={"#fbfbfc"}>
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
                    <Tbody className="relative font-mono">
                      {(triggerListQuery.data?.data || [])
                        .filter((item: any) => {
                          return item.desc.indexOf(searchKey) > -1;
                        })
                        .map((item: any) => (
                          <Tr key={item.id} _hover={{ bgColor: "#FBFBFC" }}>
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
                              {formatDate(item.updatedAt, "YYYY-MM-DD HH:mm")}
                            </Td>
                            <Td borderTopRightRadius={"10px"} borderBottomRightRadius={"10px"}>
                              <HStack spacing={1}>
                                <ConfirmButton
                                  onSuccessAction={() =>
                                    deleteTriggerMutation.mutate({ id: item.id })
                                  }
                                  headerText={String(t("Delete"))}
                                  bodyText={t("TriggerPanel.DeleteConfirm")}
                                >
                                  <IconWrap tooltip={String(t("Delete"))}>
                                    <DeleteIcon fontSize={15} />
                                  </IconWrap>
                                </ConfirmButton>
                              </HStack>
                            </Td>
                          </Tr>
                        ))}
                    </Tbody>
                  </Table>
                </TableContainer>
              </div>
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
