import { useState } from "react";
import { Search2Icon } from "@chakra-ui/icons";
import {
  Button,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";

import { formatDate } from "@/utils/format";
import request from "@/utils/request";

export default function LogsPage() {
  const [searchParams, setSearchParams] = useState<any>({});

  const logListQuery = useQuery(["logsList"], () => {
    return request.get("/api/logs", { params: searchParams });
  });

  return (
    <div className="px-4 pb-4 flex-1 bg-slate-200 flex flex-col h-full ">
      <form
        onSubmit={(event) => {
          event?.preventDefault();
          logListQuery.refetch();
        }}
      >
        <div className="flex justify-between my-4">
          <HStack spacing={2}>
            <InputGroup width={300}>
              <InputLeftElement
                height={"10"}
                pointerEvents="none"
                children={<Search2Icon color="gray.300" />}
              />
              <Input
                borderRadius="4"
                placeholder="Request ID"
                name="keywords"
                bg="white"
                onChange={(e) => {
                  setSearchParams({
                    ...searchParams,
                    keywords: e.target.value,
                  });
                }}
              />
            </InputGroup>

            <Input
              width={200}
              placeholder="函数名"
              name="functionName"
              bg="white"
              onChange={(e) => {
                setSearchParams({
                  ...searchParams,
                  functionName: e.target.value,
                });
              }}
            />
            <Input
              width={200}
              placeholder="函数 ID"
              name="functionId"
              bg="white"
              onChange={(e) => {
                setSearchParams({
                  ...searchParams,
                  functionId: e.target.value,
                });
              }}
            />
            <Button px={9} type={"submit"} colorScheme={"green"} isLoading={logListQuery.isLoading}>
              搜索
            </Button>
          </HStack>
          {/* <Pagination /> */}
        </div>
      </form>
      <div className="bg-white px-4 py-1 rounded-md overflow-y-auto h-full">
        <div className="mt-4 ">
          <TableContainer>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>时间</Th>
                  <Th>Request ID</Th>
                  <Th>函数名</Th>
                  <Th>函数 ID</Th>
                  <Th isNumeric>执行用时</Th>
                  <Th isNumeric>操作</Th>
                </Tr>
              </Thead>

              <Tbody className="relative">
                {logListQuery.data?.data?.list.map((item: any, index: number) => {
                  return (
                    <Tr key={item._id} _hover={{ bgColor: "#efefef" }}>
                      <Td className=" text-black-600 ">{formatDate(item.created_at)}</Td>
                      <Td>{item.requestId}</Td>
                      <Td>{item.func_name}</Td>
                      <Td>{item.func_id}</Td>
                      <Td isNumeric>
                        <span className=" text-green-700">{item.time_usage} ms</span>
                      </Td>
                      <Td isNumeric>
                        <Button variant={"link"} size="xs" colorScheme={"blue"}>
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
    </div>
  );
}
