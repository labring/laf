
import {
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react'
import AddIndexMoale from "./addIndexModal";

export default function IndexPannel() {
  return (
    <div>
      <div className="flex mt-2">
        <AddIndexMoale />
      </div>
      <div className='border-solid border-2 border-slate-200 mt-4 p-1'>
        <TableContainer >
          <Table variant='striped' colorScheme='gray'>
            <Thead>
              <Tr>
                <Th>索引名称</Th>
                <Th>所以属性</Th>
                <Th> 索引字段</Th>
                <Th isNumeric> 操作</Th>
              </Tr>
            </Thead>
            <Tbody>
              {[1, 2, 3, 4].map((i) =>
                <Tr>
                  <Td>Mark Chandler</Td>
                  <Td>Mark Chandler</Td>
                  <Td >devolper</Td>
                  <Td isNumeric>
                    <div className='flex justify-end'>
                      <div className="flex flex-col justify-center items-center h-8 w-16 bg-gray-200 text-red-400 ">删除</div>
                    </div>
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </TableContainer>
      </div>
    </div >
  )
}
