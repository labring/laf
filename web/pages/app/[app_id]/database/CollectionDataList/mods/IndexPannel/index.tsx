import { Button, Table, TableContainer, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/react";

import AddIndexMoale from "./addIndexModal";

export default function IndexPannel() {
  return (
    <div>
      <div className="flex mt-2">
        <AddIndexMoale />
      </div>
      <div className="border-solid border-2 border-slate-200 mt-4 p-1">
        <TableContainer>
          <Table variant="striped" colorScheme="gray">
            <Thead>
              <Tr>
                <Th>索引名称</Th>
                <Th>所以属性</Th>
                <Th> 索引字段</Th>
                <Th isNumeric> 操作</Th>
              </Tr>
            </Thead>
            <Tbody>
              {[1, 2, 3, 4].map((i) => (
                <Tr key={i}>
                  <Td>Mark Chandler</Td>
                  <Td>Mark Chandler</Td>
                  <Td>devolper</Td>
                  <Td isNumeric>
                    <Button size="sm" variant={"ghost"} colorScheme={"red"}>
                      删除
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      </div>
    </div>
  );
}
