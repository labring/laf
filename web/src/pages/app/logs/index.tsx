import { useState } from "react";
import { useForm } from "react-hook-form";
import SyntaxHighlighter from "react-syntax-highlighter";
import {
  Button,
  Center,
  HStack,
  Input,
  InputGroup,
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
  Tbody,
  Td,
  Tr,
  useDisclosure,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";

import Content from "@/components/Content";
import CopyText from "@/components/CopyText";
import Pagination from "@/components/Pagination";
import Panel from "@/components/Panel";
import { formatDate } from "@/utils/format";
import getPageInfo from "@/utils/getPageInfo";

import { queryKeys } from "./service";

import styles from "./index.module.scss";

import { LogControllerGetLogs } from "@/apis/v1/apps";

const DEFAULT_LIMIT = 20;

type TLog = {
  data: string;
  request_id: string;
  func: string;
  created_at: Date;
};

export default function LogsPage() {
  type FormData = {
    requestId: string;
    functionName: string;
  };

  const defaultValues = {};
  const { handleSubmit, register, getValues } = useForm<FormData>({
    defaultValues,
  });

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [detail, setDetail] = useState<TLog | undefined>(undefined);

  const [queryData, setQueryData] = useState({
    ...defaultValues,
  });

  const logListQuery = useQuery(
    [queryKeys.useLogsQuery, queryData],
    () => {
      return LogControllerGetLogs({ ...queryData, limit: DEFAULT_LIMIT });
    },
    {
      keepPreviousData: true,
    },
  );

  const submit = () => {
    setQueryData({
      page: 1,
      ...getValues(),
    });
  };

  return (
    <Content>
      <Panel>
        <form
          onSubmit={(event) => {
            event?.preventDefault();
            logListQuery.refetch();
          }}
        >
          <Panel.Header>
            <HStack spacing={2}>
              <InputGroup width={400}>
                <Input borderRadius="4" placeholder="Request ID" {...register("requestId")} />
              </InputGroup>

              <Input width={200} placeholder="函数名" bg="white" {...register("functionName")} />

              <Button
                py={4}
                type={"submit"}
                onClick={handleSubmit(submit)}
                isLoading={logListQuery.isFetching}
              >
                搜索
              </Button>
            </HStack>
            <Pagination
              values={getPageInfo(logListQuery.data?.data)}
              onChange={(values) => {
                setQueryData({
                  ...values,
                  ...getValues(),
                });
              }}
            />
          </Panel.Header>
        </form>
        <div className="px-4 py-1 rounded-md h-full relative" style={{ paddingBottom: 100 }}>
          {logListQuery.isFetching ? (
            <Center className="opacity-60 bg-white absolute left-0 right-0 top-0 bottom-0 z-10">
              <Spinner size={"lg"} />
            </Center>
          ) : null}
          <div className="overflow-y-auto h-full mb-4">
            <TableContainer minH={"400px"}>
              <Table variant="unstyle">
                <Tbody className="relative font-mono">
                  {logListQuery.data?.data?.list.map((item: any) => {
                    return (
                      <Tr key={item._id} _hover={{ bgColor: "#efefef" }}>
                        <Td className="text-slate-500" maxWidth="5rem">
                          [{formatDate(item.created_at, "YYYY-MM-DD HH:mm:ss")}]
                        </Td>
                        <Td maxWidth="5rem" className={styles.text + " text-primary"}>
                          <CopyText text={item.request_id}>
                            <span>{item.request_id}</span>
                          </CopyText>
                        </Td>
                        <Td maxWidth="5rem" className={styles.text + " text-purper-500"}>
                          <CopyText text={item.func}>
                            <span>{item.func}</span>
                          </CopyText>
                        </Td>
                        <Td
                          maxWidth={"300px"}
                          onClick={() => {
                            setDetail(item);
                            onOpen();
                          }}
                        >
                          <pre className="hover:text-blue-700 hover:underline max-h-[20px] overflow-hidden cursor-pointer">
                            {item.data}
                          </pre>
                        </Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
            </TableContainer>
          </div>
        </div>

        <Modal onClose={onClose} isOpen={isOpen} scrollBehavior={"inside"} size="4xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>日志详情</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <div>
                <span className={styles.primaryText}>Time: </span>
                {formatDate(detail?.created_at, "YYYY-MM-DD HH:mm:ss")}
              </div>
              <div>
                <span className={styles.primaryText}>Request ID: </span>
                {detail?.request_id}
              </div>
              <div>
                <span className={styles.primaryText}>Function: </span>
                {detail?.func}
              </div>
              <span className={styles.primaryText}>Conetent: </span>
              <SyntaxHighlighter language="json" customStyle={{ background: "#fff" }}>
                {detail?.data || ""}
              </SyntaxHighlighter>
            </ModalBody>
            <ModalFooter>
              <Button onClick={onClose}>关闭</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Panel>
    </Content>
  );
}
