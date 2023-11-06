import React from "react";
import { ArrowDownIcon, ArrowUpIcon } from "@chakra-ui/icons";
import {
  Button,
  Center,
  CloseButton,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Table,
  TableContainer,
  Tag,
  TagLabel,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useDisclosure,
} from "@chakra-ui/react";
import { t } from "i18next";

import PopConfirm from "@/components/PopConfirm";

import { useCollectionIndexQuery, useDropIndexMutation } from "../../service";
import AddIndexModal from "../AddIndexModal";

const IndexModal = (props: { children: React.ReactElement }) => {
  const { children } = props;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { data: indexList, isLoading } = useCollectionIndexQuery();
  const dropIndexMutation = useDropIndexMutation();

  return (
    <>
      {React.cloneElement(children, {
        onClick: () => {
          onOpen();
        },
      })}
      <Modal isOpen={isOpen} onClose={onClose} size="4xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader> {t("CollectionPanel.IndexManage")}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <TableContainer>
              <Table size="sm" layout="fixed">
                <Thead>
                  <Tr h={8}>
                    <Th>{t("CollectionPanel.IndexName")}</Th>
                    <Th>{t("CollectionPanel.IndexKey")}</Th>
                    <Th>{t("Properties")}</Th>
                    <Th w={20}>{t("Action")}</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {indexList?.list?.map((v: any) => (
                    <Tr key={v.name}>
                      <Td className="truncate">{v.name}</Td>
                      <Td overflowX="scroll">
                        <HStack>
                          {Object.entries(v.key || {}).map(([name, type]) => (
                            <Tag
                              key={name}
                              variant="outline"
                              colorScheme="cyan"
                              flexShrink={0}
                              maxW="unset"
                            >
                              <TagLabel>{name}</TagLabel>
                              <TagLabel color="gray" mx={1}>
                                |
                              </TagLabel>
                              <TagLabel color="orange" userSelect="none">
                                {type === 1 && <ArrowUpIcon />}
                                {type === -1 && <ArrowDownIcon />}
                                {typeof type === "string" && `(${type})`}
                              </TagLabel>
                            </Tag>
                          ))}
                        </HStack>
                      </Td>
                      <Td overflowX="scroll">
                        <HStack>
                          {v.unique && <Tag userSelect="none">UNIQUE</Tag>}
                          {v.max && (
                            <Tag userSelect="none">
                              <TagLabel>MAX</TagLabel>
                              <TagLabel color="gray" mx={1}>
                                |
                              </TagLabel>
                              <TagLabel color="orange" userSelect="none">
                                {v.max}
                              </TagLabel>
                            </Tag>
                          )}
                          {!!v.expireAfterSeconds && (
                            <Tag userSelect="none">
                              <TagLabel>TTL</TagLabel>
                              <TagLabel color="gray" mx={1}>
                                |
                              </TagLabel>
                              <TagLabel color="orange" userSelect="none">
                                {v.expireAfterSeconds}
                              </TagLabel>
                            </Tag>
                          )}
                        </HStack>
                      </Td>
                      <Td>
                        <PopConfirm
                          onConfirm={() => dropIndexMutation.mutateAsync(v.name)}
                          title={String(t("Delete"))}
                          placement="left"
                          description={t("CollectionPanel.ConfirmDeleteIndex")}
                        >
                          <CloseButton fontSize={10} />
                        </PopConfirm>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
              {isLoading && (
                <Center className="min-h-[360px]">
                  <Spinner />
                </Center>
              )}
            </TableContainer>
          </ModalBody>
          <ModalFooter>
            <AddIndexModal>
              <Button>{t("CollectionPanel.AddIndex")}</Button>
            </AddIndexModal>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

IndexModal.displayName = "IndexModal";

export default IndexModal;
