import { useState } from "react";
import { useForm } from "react-hook-form";
import SyntaxHighlighter from "react-syntax-highlighter";
import { Search2Icon } from "@chakra-ui/icons";
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
  ModalFooter,
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
import { useQuery } from "@tanstack/react-query";

import CopyText from "@/components/CopyText";
import Pagination from "@/components/Pagination";
import { formatDate } from "@/utils/format";
import getPageInfo from "@/utils/getPageInfo";

import { queryKeys } from "./service";

import { LogControllerGetLogs } from "@/apis/v1/apps";

const DEFAULT_LIMIT = 20;

type TLog = {
  data: string;
  request_id: string;
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
    <div className="px-4 pb-4 flex-1 flex flex-col h-full ">
      <form
        onSubmit={(event) => {
          event?.preventDefault();
          logListQuery.refetch();
        }}
      >
        <div className="flex justify-between my-4">
          <HStack spacing={2}>
            <InputGroup width={400}>
              <InputLeftElement
                height={"10"}
                pointerEvents="none"
                children={<Search2Icon color="gray.300" />}
              />
              <Input
                borderRadius="4"
                placeholder="Request ID"
                bg="white"
                {...register("requestId")}
              />
            </InputGroup>

            <Input width={200} placeholder="函数名" bg="white" {...register("functionName")} />

            <Button
              px={9}
              type={"submit"}
              colorScheme={"green"}
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
        </div>
      </form>
      <div className="px-4 py-1 rounded-md h-full relative border " style={{ paddingBottom: 100 }}>
        {logListQuery.isFetching ? (
          <Center className="opacity-60 bg-white absolute left-0 right-0 top-0 bottom-0 z-10">
            <Spinner size={"lg"} />
          </Center>
        ) : null}
        <div className="overflow-y-auto h-full mb-4">
          <TableContainer minH={"400px"}>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th width={"200px"}>时间</Th>
                  <Th width={"200px"}>Request ID</Th>
                  <Th>函数名</Th>
                  <Th>Content</Th>
                  <Th>操作</Th>
                </Tr>
              </Thead>

              <Tbody className="relative font-mono">
                {logListQuery.data?.data?.list.map((item: any) => {
                  return (
                    <Tr key={item._id} _hover={{ bgColor: "#efefef" }}>
                      <Td width={"180px"} className="text-slate-500 ">
                        [{formatDate(item.created_at, "YYYY-MM-DD HH:mm:ss")}]
                      </Td>
                      <Td width={"200px"}>
                        <CopyText text={item.request_id}>
                          <span>{item.request_id}</span>
                        </CopyText>
                      </Td>
                      <Td>
                        <CopyText text={item.func}>
                          <span>{item.func}</span>
                        </CopyText>
                      </Td>
                      <Td maxWidth={"300px"}>
                        <pre className="text-green-700 max-h-[20px] overflow-hidden">
                          {item.data}
                        </pre>
                      </Td>
                      <Td width={"100px"}>
                        <Button
                          variant={"link"}
                          size="xs"
                          colorScheme={"blue"}
                          onClick={() => {
                            setDetail(item);
                            onOpen();
                          }}
                        >
                          查看
                        </Button>
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
          <ModalHeader>
            <span className="font-normal font-mono">Request ID: {detail?.request_id}</span>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <SyntaxHighlighter language="json" customStyle={{ background: "#fff" }}>
              {detail?.data || ""}
            </SyntaxHighlighter>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>关闭</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
