import { DeleteIcon, DownloadIcon } from "@chakra-ui/icons";
import { HStack, Table, TableContainer, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/react";

import IconWrap from "@/components/IconWrap";
import PanelHeader from "@/components/Panel/Header";

import { useFileListQuery } from "../../service";
import CreateFolderModal from "../CreateFolderModal";
import HostingDrawer from "../HostingDrawer";
import UploadButton from "../UploadButton";

import RightPanel from "@/pages/app/mods/RightPanel";

export default function FileList() {
  const fileListQuery = useFileListQuery();

  return (
    <RightPanel>
      <PanelHeader>
        <HStack spacing={2}>
          <UploadButton />
          <CreateFolderModal />
          <HostingDrawer />
        </HStack>
        <HStack spacing={12}>
          <span>容量： 1GB </span>
          <span>已用： 0 </span>
          <span>文件数： 30 </span>
        </HStack>
      </PanelHeader>
      <div className="m-2 ">
        <TableContainer>
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>..</Th>
                <Th>文件路径</Th>
                <Th isNumeric>大小</Th>
                <Th isNumeric>更新时间</Th>
                <Th isNumeric>
                  <span className="mr-2">操作</span>
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {(fileListQuery?.data?.data || []).map((file: any) => {
                return (
                  <Tr _hover={{ bgColor: "#efefef" }} key={file.path}>
                    <Td>
                      {file.prefix ? (
                        <span className="text-blue-600 underline cursor-pointer">{file.name}</span>
                      ) : (
                        <span>{file.name}</span>
                      )}
                    </Td>
                    <Td>{file.path}</Td>
                    <Td isNumeric>19KB</Td>
                    <Td isNumeric>{file.updateTime}</Td>
                    <Td isNumeric className="flex justify-end">
                      <IconWrap onClick={() => {}}>
                        <DownloadIcon fontSize={12} />
                      </IconWrap>
                      <IconWrap onClick={() => {}}>
                        <DeleteIcon fontSize={12} />
                      </IconWrap>
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </TableContainer>
      </div>
    </RightPanel>
  );
}
