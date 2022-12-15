import { DeleteIcon, DownloadIcon } from "@chakra-ui/icons";
import { HStack, Table, TableContainer, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";

import IconWrap from "@/components/IconWrap";
import PanelHeader from "@/components/Panel/Header";
import { formatDate } from "@/utils/format";

import useStorageStore, { TFile } from "../../store";
import CreateFolderModal from "../CreateFolderModal";
import HostingDrawer from "../HostingDrawer";
import UploadButton from "../UploadButton";

import useAwsS3 from "@/hooks/useAwsS3";
import RightPanel from "@/pages/app/mods/RightPanel";

export default function FileList() {
  const { getList } = useAwsS3();

  const { currentStorage } = useStorageStore();
  const bucketName = currentStorage?.metadata.name;

  const query = useQuery(
    ["fileList", bucketName, "/"],
    () => getList(bucketName, { marker: "", prefix: "/" }),
    {
      enabled: !!bucketName,
    },
  );

  return (
    <RightPanel>
      <PanelHeader>
        <HStack spacing={2}>
          <UploadButton />
          <CreateFolderModal />
          <HostingDrawer />
        </HStack>
        <HStack spacing={12}>
          <span>容量： {currentStorage?.spec.storage} </span>
          <span>已用： {currentStorage?.status.capacity.storage} </span>
          <span>文件数： {currentStorage?.status.capacity.objectCount} </span>
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
              {(query?.data || []).map((file: TFile) => {
                return (
                  <Tr _hover={{ bgColor: "#efefef" }} key={file.Key}>
                    <Td>jpg</Td>
                    <Td style={{ maxWidth: 200 }}>{file.Key}</Td>
                    <Td isNumeric>{file.Size}</Td>
                    <Td isNumeric>{formatDate(file.LastModified)}</Td>
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
