import { useState } from "react";
import { AddIcon, DeleteIcon, Search2Icon } from "@chakra-ui/icons";
import {
  Button,
  Center,
  Input,
  InputGroup,
  InputLeftElement,
  Spinner,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { t } from "i18next";

import ConfirmButton from "@/components/ConfirmButton";
import Content from "@/components/Content";
import IconWrap from "@/components/IconWrap";
import Panel from "@/components/Panel";
import { formatDate } from "@/utils/format";

import AddTriggerModal from "./AddTriggerModal";
import { useDeleteTriggerMutation, useTriggerListQuery } from "./service";

export default function TriggerPage() {
  const [searchKey, setSearchKey] = useState<string>("");
  const triggerListQuery = useTriggerListQuery(() => {});
  const deleteTriggerMutation = useDeleteTriggerMutation(() => {
    triggerListQuery.refetch();
  });

  return (
    <Content>
      <Panel className="h-full">
        <Panel.Header className="flex-none">
          <div className="flex py-4 px-2">
            <AddTriggerModal>
              <Button colorScheme="primary" style={{ padding: "0 40px" }} leftIcon={<AddIcon />}>
                {t("TriggerPanel.AddTrigger")}
              </Button>
            </AddTriggerModal>
            <InputGroup className="ml-4">
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
                bg={"gray.100"}
                onChange={(e) => setSearchKey(e.target.value)}
              />
            </InputGroup>
          </div>
        </Panel.Header>
        <div className="px-2 py-1 rounded-md h-full relative">
          {triggerListQuery.isFetching ? (
            <Center className="opacity-60 bg-white absolute left-0 right-0 top-0 bottom-0 z-10">
              <Spinner size={"lg"} />
            </Center>
          ) : null}
          <div className="overflow-y-auto h-full mb-4">
            <TableContainer minH={"400px"}>
              <Table variant="unstyle">
                <Thead>
                  <Tr>
                    <Th>{t("TriggerPanel.Name")}</Th>
                    <Th>{t("TriggerPanel.Function")}</Th>
                    <Th>{t("TriggerPanel.Type")}</Th>
                    <Th>{t("TriggerPanel.Time")}</Th>
                    <Th>{t("Common.Operation")}</Th>
                  </Tr>
                </Thead>
                <Tbody className="relative font-mono">
                  {(triggerListQuery.data?.data || [])
                    .filter((item: any) => {
                      return item.desc.indexOf(searchKey) > -1;
                    })
                    .map((item: any) => {
                      return (
                        <Tr key={item.id} _hover={{ bgColor: "#efefef" }}>
                          <Td>
                            <span>{item.desc}</span>
                          </Td>
                          <Td>
                            <span>{item.target}</span>
                          </Td>
                          <Td>
                            <span>{t("TriggerPanel.SetTimeout")}</span>
                          </Td>
                          <Td className="text-slate-500" maxWidth="5rem">
                            {formatDate(item.updatedAt, "YYYY-MM-DD HH:mm:ss")}
                          </Td>
                          <Td maxWidth={"300px"}>
                            <ConfirmButton
                              onSuccessAction={() => deleteTriggerMutation.mutate({ id: item.id })}
                              headerText={String(t("Common.Delete"))}
                              bodyText={t("TriggerPanel.DeleteConfirm")}
                            >
                              <IconWrap tooltip={String(t("Common.Delete"))}>
                                <DeleteIcon fontSize={15} />
                              </IconWrap>
                            </ConfirmButton>
                          </Td>
                        </Tr>
                      );
                    })}
                </Tbody>
              </Table>
            </TableContainer>
          </div>
        </div>
      </Panel>
    </Content>
  );
}
