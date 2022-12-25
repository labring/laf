import { useEffect, useState } from "react";
import { DeleteIcon, DownloadIcon, ViewIcon } from "@chakra-ui/icons";
import { HStack, Table, TableContainer, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { t } from "i18next";

import ConfirmButton from "@/components/ConfirmButton";
import IconWrap from "@/components/IconWrap";
import PanelHeader from "@/components/Panel/Header";
import { formatDate, formatSize } from "@/utils/format";

import useStorageStore, { TFile } from "../../store";
import CreateFolderModal from "../CreateFolderModal";
import HostingDrawer from "../HostingDrawer";
import PathLink from "../PathLink";
import UploadButton from "../UploadButton";

import useAwsS3 from "@/hooks/useAwsS3";
import RightPanel from "@/pages/app/mods/RightPanel";

export default function FileList() {
  const { getList, getFileUrl, deleteFile } = useAwsS3();

  const { currentStorage, prefix, setPrefix } = useStorageStore();
  const bucketName = currentStorage?.metadata.name;

  const query = useQuery(
    ["fileList", bucketName],
    () => getList(bucketName, { marker: "", prefix }),
    {
      enabled: !!bucketName,
    },
  );

  useEffect(() => {
    query.refetch();
  }, [bucketName, prefix]);

  const viewAppFile = (file: TFile) => {
    if (file.Prefix) {
      changeDirectory(file);
      return
    }

    window.open(getFileUrl(bucketName!, file.Key), "_blank");
  }

  const changeDirectory = (file: TFile) => {
    setPrefix(file.Prefix!)
  }

  return (
    <RightPanel>
      <PanelHeader>
        <HStack spacing={2}>
          <UploadButton onUploadSuccess={() => query.refetch()} />
          <CreateFolderModal />
          <PathLink />
          {/* <HostingDrawer /> */}
        </HStack>
        <HStack spacing={12}>
          <span>容量： {currentStorage?.spec.storage} </span>
          <span>已用： {currentStorage?.status?.capacity?.storage} </span>
          <span>文件数： {currentStorage?.status?.capacity?.objectCount} </span>
        </HStack>
      </PanelHeader>
      <div className="m-2 ">
        <TableContainer>
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>文件路径</Th>
                <Th>文件类型</Th>
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
                  <Tr _hover={{ bgColor: "#efefef" }} key={file.Key || file.Prefix}>
                    <Td style={{ maxWidth: 200 }}>
                      {file.Prefix ?
                        <a className="cursor-pointer text-blue-700 underline" onClick={() => changeDirectory(file)}>{bucketName + '/' + file.Prefix}</a>
                        : bucketName + '/' + file.Key}
                    </Td>
                    <Td>--</Td>
                    <Td isNumeric>{file.Size ? formatSize(file.Size) : '--'}</Td>
                    <Td isNumeric>{file.LastModified ? formatDate(file.LastModified) : '--'}</Td>
                    <Td isNumeric className="flex justify-end">
                      <IconWrap onClick={() => viewAppFile(file)}>
                        <ViewIcon fontSize={12} />
                      </IconWrap>
                      <ConfirmButton
                        onSuccessAction={async () => {
                          await deleteFile(bucketName!, file.Key);
                          query.refetch();
                        }}
                        headerText={String(t("Delete"))}
                        bodyText={'确认要删除文件吗？'}
                      >
                        <IconWrap tooltip={String(t("Delete"))}>
                          <DeleteIcon
                            fontSize={14}
                          />
                        </IconWrap>
                      </ConfirmButton>
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
