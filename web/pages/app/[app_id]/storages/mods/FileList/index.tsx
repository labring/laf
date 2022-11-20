import React from "react";
import { DeleteIcon, DownloadIcon } from "@chakra-ui/icons";
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

import IconWrap from "@/components/IconWrap";

import useStorageStore, { TStorage } from "../../store";
import CreateFolderModal from '../CreateFolderModal'
import FileUpload from '../FileUpload'
import HostingDrawer from '../HostingDrawer'


export default function FileList() {
  const store = useStorageStore((store) => store);

  const changeDirectory = (row) => {
    if (!row.Prefix) { return }
  }

  return (
    <div className="flex-1">
      <div className="flex justify-between border-b px-2" style={{ height: 32 }}>
        <HStack spacing={2}>
          <FileUpload />
          <CreateFolderModal />
          <HostingDrawer />
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
                <Th>操作</Th>
              </Tr>
            </Thead>
            <Tbody>
              {(store.files || []).map((file) => {
                return (
                  <Tr _hover={{ bgColor: "#efefef" }} key={file.path}>
                    <Td>
                      {file.prefix ? <span className="text-blue-600 underline cursor-pointer">{file.name}</span> : <span>{file.name}</span>}
                    </Td>
                    <Td>{file.path}</Td>
                    <Td isNumeric>19KB</Td>
                    <Td isNumeric>{file.updateTime}</Td>
                    <Td className="flex">
                      <IconWrap onClick={() => { }}>
                        <DownloadIcon fontSize={12} />
                      </IconWrap>
                      <IconWrap onClick={() => { }}>
                        <DeleteIcon fontSize={12} />
                      </IconWrap>
                    </Td>
                  </Tr>
                )
              })}
            </Tbody>
          </Table>
        </TableContainer>
      </div>
    </div>
  );
}
