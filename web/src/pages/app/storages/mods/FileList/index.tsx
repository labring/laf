import { DeleteIcon, ViewIcon } from "@chakra-ui/icons";
import { HStack, Table, TableContainer, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { t } from "i18next";

import ConfirmButton from "@/components/ConfirmButton";
import FileTypeIcon from "@/components/FileTypeIcon";
import { Col } from "@/components/Grid";
import IconWrap from "@/components/IconWrap";
import Panel from "@/components/Panel";
import { formatDate, formateType, formatSize } from "@/utils/format";

import useStorageStore, { TFile } from "../../store";
import CreateFolderModal from "../CreateFolderModal";
import PathLink from "../PathLink";
import UploadButton from "../UploadButton";

import styles from "../index.module.scss";

import useAwsS3 from "@/hooks/useAwsS3";

export default function FileList() {
  const { getList, getFileUrl, deleteFile } = useAwsS3();
  const { currentStorage, prefix, setPrefix } = useStorageStore();
  const bucketName = currentStorage?.metadata.name;
  const bucketType = currentStorage?.spec.policy;

  const query = useQuery(
    ["fileList", bucketName, prefix],
    () => getList(bucketName, { marker: "", prefix }),
    {
      enabled: !!bucketName,
    },
  );

  const viewAppFile = (file: TFile) => {
    if (file.Prefix) {
      changeDirectory(file);
      return;
    }
    const fileUrl =
      bucketType === "private"
        ? getFileUrl(bucketName!, file.Key)
        : `http://${bucketName}.${(window as any).location.host.replace("www", "oss")}/${file.Key}`;

    window.open(fileUrl, "_blank");
  };

  const changeDirectory = (file: TFile) => {
    setPrefix(file.Prefix!);
  };

  return (
    <Col>
      <Panel style={{ maxHeight: 40 }}>
        <Panel.Header>
          <HStack spacing={2}>
            <UploadButton onUploadSuccess={() => query.refetch()} />
            <CreateFolderModal onCreateSuccess={() => query.refetch()} />
          </HStack>
        </Panel.Header>
      </Panel>
      <Panel>
        <Panel.Header className="border-b-2">
          <PathLink />
          <span className={"before:bg-purple-500 " + styles.circle}>
            文件数： {currentStorage?.status?.capacity?.objectCount}{" "}
          </span>
        </Panel.Header>
        <div className="px-2 pb-20 h-full overflow-auto">
          {!query.data ||
          query.data.length === 0 ||
          (query.data.length === 1 && query.data[0].Key === prefix) ? (
            <div className="h-full flex items-center  justify-center">请选择文件或者文件夹上传</div>
          ) : (
            <TableContainer>
              <Table variant="simple" size="sm">
                <Thead className="h-8 bg-gray-100 text-gray-300">
                  <Tr>
                    <Th>文件名</Th>
                    <Th>文件类型</Th>
                    <Th isNumeric>大小</Th>
                    <Th isNumeric>更新时间</Th>
                    <Th isNumeric>
                      <span className="mr-2">操作</span>
                    </Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {query.data
                    .filter((file) => file.Key !== prefix)
                    .map((file: TFile) => {
                      const fileName = file.Key?.split("/");
                      const dirName = file.Prefix?.split("/") || [];
                      const fileType = file.Prefix
                        ? "folder"
                        : formateType(fileName[fileName.length - 1]);
                      return (
                        <Tr _hover={{ bgColor: "#efefef" }} key={file.Key || file.Prefix}>
                          <Td
                            style={{
                              maxWidth: 200,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            <FileTypeIcon type={fileType} />
                            {file.Prefix ? (
                              <span
                                className="ml-2 cursor-pointer"
                                onClick={() => changeDirectory(file)}
                              >
                                {dirName[dirName.length - 2]}
                              </span>
                            ) : (
                              <span className="ml-2">{fileName[fileName.length - 1]}</span>
                            )}
                          </Td>
                          <Td>{fileType}</Td>
                          <Td isNumeric>{file.Size ? formatSize(file.Size) : "--"}</Td>
                          <Td isNumeric>
                            {file.LastModified ? formatDate(file.LastModified) : "--"}
                          </Td>
                          <Td isNumeric className="flex justify-end">
                            <IconWrap
                              placement="left"
                              tooltip={
                                bucketType === "private" && file.Key
                                  ? "临时链接,有效期15分钟"
                                  : undefined
                              }
                              onClick={() => viewAppFile(file)}
                            >
                              <ViewIcon fontSize={12} />
                            </IconWrap>
                            {!file.Prefix ? (
                              <ConfirmButton
                                onSuccessAction={async () => {
                                  await deleteFile(bucketName!, file.Key);
                                  query.refetch();
                                }}
                                headerText={String(t("Delete"))}
                                bodyText={"确认要删除文件吗？"}
                              >
                                <IconWrap tooltip={String(t("Delete"))}>
                                  <DeleteIcon fontSize={14} />
                                </IconWrap>
                              </ConfirmButton>
                            ) : null}
                          </Td>
                        </Tr>
                      );
                    })}
                </Tbody>
              </Table>
            </TableContainer>
          )}
        </div>
      </Panel>
    </Col>
  );
}
