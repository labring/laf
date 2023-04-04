import { Button, Table, TableContainer, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/react";
import { t } from "i18next";

import AddIndexModal from "./addIndexModal";

export default function IndexPanel() {
  return (
    <div>
      <div className="mt-2 flex">
        <AddIndexModal />
      </div>
      <div className="mt-4 rounded border border-slate-200 ">
        <TableContainer>
          <Table variant="striped" colorScheme="gray">
            <Thead>
              <Tr>
                <Th>索引名称</Th>
                <Th>索引属性</Th>
                <Th>索引字段</Th>
                <Th isNumeric>
                  <span className="mr-3">操作</span>
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {[1, 2, 3, 4].map((i) => (
                <Tr key={i}>
                  <Td>Mark Chandler</Td>
                  <Td>Mark Chandler</Td>
                  <Td>developer</Td>
                  <Td isNumeric>
                    <Button size="sm" variant={"ghost"} colorScheme={"red"}>
                      {t("Delete")}
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
