import React, { useState } from "react";
import { Search2Icon } from "@chakra-ui/icons";
import {
  Button,
  HStack,
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
import { useQuery } from "@tanstack/react-query";

import Pagination from "@/components/Pagination";
import { formatDate } from "@/utils/format";
import request from "@/utils/request";

export default function LogsPage() {
  const [searchParams, setSearchParams] = useState<any>({});

  const logListQuery = useQuery(["logsList"], () => {
    return request.get("/api/logs", { params: searchParams });
  });

  return (
    <div className="px-4 py-2 flex-1 bg-slate-200">
      <form
        onSubmit={(event) => {
          event?.preventDefault();
          logListQuery.refetch();
        }}
      >
        <div className="flex justify-between">
          <HStack spacing={2}>
            <InputGroup width={300}>
              <InputLeftElement
                height={"8"}
                width="12"
                pointerEvents="none"
                children={<Search2Icon bgSize="sm" color="gray.300" />}
              />
              <Input
                size="sm"
                borderRadius="4"
                placeholder="Request ID"
                name="keywords"
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
              size="sm"
              placeholder="函数名"
              name="functionName"
              onChange={(e) => {
                setSearchParams({
                  ...searchParams,
                  functionName: e.target.value,
                });
              }}
            />
            <Input
              width={200}
              size="sm"
              placeholder="函数 ID"
              name="functionId"
              onChange={(e) => {
                setSearchParams({
                  ...searchParams,
                  functionId: e.target.value,
                });
              }}
            />
            <Button
              px={9}
              type={"submit"}
              size="sm"
              colorScheme={"primary"}
              isLoading={logListQuery.isLoading}
            >
              搜索
            </Button>
          </HStack>
          <Pagination />
        </div>
      </form>
      <div className="bg-white px-4 py-1  rounded-md">
        <div className="mt-4">
          {logListQuery.isFetching ? <Spinner /> : null}
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
              <Tbody>
                {logListQuery.data?.data?.list.map((item: any, index: number) => {
                  return (
                    <Tr key={item._id} _hover={{ bgColor: "#efefef" }}>
                      <Td>{formatDate(item.created_at)}</Td>
                      <Td>{item.requestId}</Td>
                      <Td>{item.func_name}</Td>
                      <Td>{item.func_id}</Td>
                      <Td isNumeric>{item.time_usage} ms</Td>
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
