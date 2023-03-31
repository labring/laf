import { BiCloudUpload, BiRefresh } from "react-icons/bi";
import { DeleteIcon, ViewIcon } from "@chakra-ui/icons";
import {
  Button,
  Center,
  HStack,
  Spinner,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useColorMode,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import clsx from "clsx";
import { t } from "i18next";

import ConfirmButton from "@/components/ConfirmButton";
import EmptyBox from "@/components/EmptyBox";
// import CopyText from "@/components/CopyText";
import FileTypeIcon from "@/components/FileTypeIcon";
import IconWrap from "@/components/IconWrap";
import Panel from "@/components/Panel";
import { BUCKET_POLICY_TYPE } from "@/constants";
import { formatDate, formateType, formatSize } from "@/utils/format";

import useStorageStore, { TFile } from "../../store";
import CreateFolderModal from "../CreateFolderModal";
import CreateWebsiteModal from "../CreateWebsiteModal";
// import CreateWebsiteModal from "../CreateWebsiteModal";
import PathLink from "../PathLink";
import UploadButton from "../UploadButton";

// import styles from "../index.module.scss";
import useAwsS3 from "@/hooks/useAwsS3";
export default function FileList() {
  const { getList, getFileUrl, deleteFile } = useAwsS3();
  const { currentStorage, prefix, setPrefix, getOrigin } = useStorageStore();
  const bucketName = currentStorage?.name;
  const bucketType = currentStorage?.policy;

  const { colorMode } = useColorMode();
  const darkMode = colorMode === "dark";

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

    let fileUrl = "";

    if (bucketType === "private") {
      fileUrl = getFileUrl(bucketName!, file.Key);
    } else {
      fileUrl = getOrigin(currentStorage?.domain?.domain || "") + `/${file.Key}` || "";
    }

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
            <UploadButton onUploadSuccess={() => query.refetch()}>
              <Button
                size="sm"
                variant="textGhost"
                leftIcon={<BiCloudUpload fontSize={22} className="text-grayModern-500" />}
                disabled={currentStorage === undefined}
              >
                <p className="font-semibold">{t("StoragePanel.Upload")}</p>
              </Button>
            </UploadButton>
            <CreateFolderModal onCreateSuccess={() => query.refetch()} />
            <Button
              size="xs"
              variant="textGhost"
              leftIcon={<BiRefresh fontSize={22} className="text-grayModern-500" />}
              disabled={currentStorage === undefined}
              onClick={() => {
                query.refetch();
              }}
            >
              {t("RefreshData")}
            </Button>
          </HStack>
          <HStack spacing={2}>
            <CreateWebsiteModal />
          </HStack>
        </Panel.Header>
      </Panel>
      <Panel className="flex-grow overflow-hidden">
        <Panel.Header
          className={clsx("mb-4 ml-4 flex-none", {
            "border-b-2": !darkMode,
            "border-lafWhite-400": !darkMode,
          })}
        >
          <PathLink />
          {/* <span className={"before:bg-purple-600 " + styles.circle}>
            TODO: 文件数： {currentStorage?.name}
          </span> */}
        </Panel.Header>
        <div className="flex-grow overflow-hidden px-2 pb-2">
          {query.isFetching ? (
            <Center className="bg-white-200 h-full opacity-60">
              <Spinner size="lg" />
            </Center>
          ) : !query.data ||
            query.data.length === 0 ||
            (query.data.length === 1 && query.data[0].Key === prefix) ? (
            <EmptyBox>
              <UploadButton onUploadSuccess={() => query.refetch()}>
                <div className="text-lg">
                  <span>{t("StoragePanel.UploadTip")}</span>
                  <span className="ml-2 cursor-pointer text-primary-600 hover:border-b-2 hover:border-primary-600">
                    {t("StoragePanel.InstantUpload")}
                  </span>
                </div>
              </UploadButton>
            </EmptyBox>
          ) : (
            <TableContainer className="h-full" style={{ overflowY: "auto" }}>
              <Table variant="simple" size="sm">
                <Thead
                  className={clsx("h-8", {
                    "bg-lafWhite-400": !darkMode,
                    "bg-lafDark-100": darkMode,
                  })}
                >
                  <Tr>
                    <Th>{t("StoragePanel.FileName")}</Th>
                    <Th>{t("StoragePanel.FileType")}</Th>
                    <Th>{t("StoragePanel.Size")}</Th>
                    <Th>{t("StoragePanel.Time")}</Th>
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
                        <Tr
                          className={clsx({
                            "hover:bg-lafWhite-600": !darkMode,
                            "hover:bg-lafDark-300": darkMode,
                          })}
                          key={file.Key || file.Prefix}
                        >
                          <Td
                            style={{
                              maxWidth: 200,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                            onClick={() =>
                              file.Prefix ? changeDirectory(file) : viewAppFile(file)
                            }
                            className="cursor-pointer font-bold"
                          >
                            <FileTypeIcon type={fileType} />
                            {file.Prefix ? (
                              <span className="ml-2">{dirName[dirName.length - 2]}</span>
                            ) : (
                              <span className="ml-2">{fileName[fileName.length - 1]}</span>
                            )}
                          </Td>
                          <Td>{fileType}</Td>
                          <Td>{file.Size ? formatSize(file.Size) : "--"}</Td>
                          <Td>{file.LastModified ? formatDate(file.LastModified) : "--"}</Td>
                          <Td
                            isNumeric
                            className={clsx("flex justify-end space-x-2", {
                              "text-grayModern-900": !darkMode,
                            })}
                          >
                            <IconWrap
                              placement="left"
                              tooltip={
                                bucketType === BUCKET_POLICY_TYPE.private && file.Key
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
