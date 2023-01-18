import { DeleteIcon, ViewIcon } from "@chakra-ui/icons";
import { HStack, Table, TableContainer, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { t } from "i18next";

import ConfirmButton from "@/components/ConfirmButton";
import FileTypeIcon from "@/components/FileTypeIcon";
import IconWrap from "@/components/IconWrap";
import Panel from "@/components/Panel";
import { formatDate, formateType, formatSize } from "@/utils/format";

import useStorageStore, { TFile } from "../../store";
import CreateFolderModal from "../CreateFolderModal";
import PathLink from "../PathLink";
import UploadButton from "../UploadButton";

// import styles from "../index.module.scss";
import useAwsS3 from "@/hooks/useAwsS3";
import useGlobalStore from "@/pages/globalStore";
export default function FileList() {
  const { getList, getFileUrl, deleteFile } = useAwsS3();
  const { currentStorage, prefix, setPrefix } = useStorageStore();
  const bucketName = currentStorage?.name;
  const bucketType = currentStorage?.policy;
  const { currentApp } = useGlobalStore();
  const address = currentApp?.storage?.credentials?.endpoint.split("//");

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
    console.log(currentApp);
    const fileUrl =
      bucketType === "private"
        ? getFileUrl(bucketName!, file.Key)
        : `${(address && address[0]) || "http"}//${bucketName}.${(address && address[1]) || ""}/${
            file.Key
          }`;

    window.open(fileUrl, "_blank");
  };

  const changeDirectory = (file: TFile) => {
    setPrefix(file.Prefix!);
  };

  return (
    <>
      <Panel style={{ flexBasis: 40, flexShrink: 0 }}>
        <Panel.Header>
          <HStack spacing={2}>
            <UploadButton onUploadSuccess={() => query.refetch()} />
            <CreateFolderModal onCreateSuccess={() => query.refetch()} />
          </HStack>
        </Panel.Header>
      </Panel>
      <Panel className="flex-grow overflow-hidden">
        <Panel.Header className="border-b-2 border-lafWhite-400 flex-none mb-4 ml-4">
          <PathLink />
          {/* <span className={"before:bg-purple-600 " + styles.circle}>
            TODO: 文件数： {currentStorage?.name}
          </span> */}
        </Panel.Header>
        <div className="px-2 pb-2 flex-grow overflow-hidden">
          {!query.data ||
          query.data.length === 0 ||
          (query.data.length === 1 && query.data[0].Key === prefix) ? (
            <div className="h-full flex items-center  justify-center">
              {t("StoragePanel.UploadTip")}
            </div>
          ) : (
            <TableContainer className="h-full" style={{ overflowY: "auto" }}>
              <Table variant="simple" size="sm">
                <Thead className="h-8 bg-lafWhite-400 text-grayModern-500">
                  <Tr>
                    <Th>{t("StoragePanel.FileName")}</Th>
                    <Th>{t("StoragePanel.FileType")}</Th>
                    <Th isNumeric>{t("StoragePanel.Size")}</Th>
                    <Th isNumeric>{t("StoragePanel.Time")}</Th>
                    <Th isNumeric>
                      <span className="mr-2">{t("Operation")}</span>
                    </Th>
                  </Tr>
                </Thead>
                <Tbody className="text-grayModern-500">
                  {query.data
                    .filter((file) => file.Key !== prefix)
                    .map((file: TFile) => {
                      const fileName = file.Key?.split("/");
                      const dirName = file.Prefix?.split("/") || [];
                      const fileType = file.Prefix
                        ? "folder"
                        : formateType(fileName[fileName.length - 1]);
                      return (
                        <Tr className="hover:bg-lafWhite-600" key={file.Key || file.Prefix}>
                          <Td
                            style={{
                              maxWidth: 200,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                            className="text-grayModern-900 font-medium"
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
                          <Td isNumeric className="flex justify-end text-grayModern-900">
                            <IconWrap
                              placement="left"
                              tooltip={
                                bucketType === "private" && file.Key
                                  ? t("StoragePanel.TimeTip").toString()
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
                                bodyText={t("StoragePanel.DeleteFileTip")}
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
    </>
  );
}
