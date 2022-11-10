import React from "react";
import {
  Button,
  HStack,
  Table,
  TableCaption,
  TableContainer,
  Tbody,
  Td,
  Tfoot,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";

export default function FileList() {
  return (
    <div className="flex-1">
      <div className="flex justify-between border-b px-2" style={{ height: 32 }}>
        <HStack spacing={2}>
          <Button size="xs">upload</Button>
          <Button size="xs">新建文件</Button>
          <Button size="xs">网站托管</Button>
        </HStack>
        <HStack spacing={12}>
          <span>容量： 1GB </span>
          <span>已用： 0 </span>
          <span>文件数： 30 </span>
        </HStack>
      </div>
      <div className="m-2 ">
        <TableContainer>
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>..</Th>
                <Th>文件路径</Th>
                <Th isNumeric>大小</Th>
                <Th isNumeric>更新时间</Th>
              </Tr>
            </Thead>
            <Tbody>
              <Tr _hover={{ bgColor: "#efefef" }}>
                <Td>inches</Td>
                <Td>h5/static/emoticon.json</Td>
                <Td isNumeric>19KB</Td>
                <Td isNumeric>2022-07-26 11:20:32</Td>
              </Tr>
              <Tr _hover={{ bgColor: "#efefef" }}>
                <Td>feet</Td>
                <Td>h5/static/emoticon.json</Td>
                <Td isNumeric>19KB</Td>
                <Td isNumeric>2022-07-26 11:20:32</Td>
              </Tr>
              <Tr _hover={{ bgColor: "#efefef" }}>
                <Td>yards</Td>
                <Td>h5/static/emoticon.json</Td>
                <Td isNumeric>19KB</Td>
                <Td isNumeric>2022-07-26 11:20:32</Td>
              </Tr>
            </Tbody>
          </Table>
        </TableContainer>
      </div>
    </div>
  );
}
