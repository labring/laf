import React from "react";
import { Trans, useTranslation } from "react-i18next";
import { CheckCircleIcon, WarningIcon } from "@chakra-ui/icons";
import {
  Button,
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Spinner,
  useColorMode,
  useDisclosure,
} from "@chakra-ui/react";
import clsx from "clsx";

import FileUpload from "@/components/FileUpload";

import useStorageStore from "../../store";

import useAwsS3 from "@/hooks/useAwsS3";
import useGlobalStore from "@/pages/globalStore";

export type TFileItem = {
  status: string;
  fileName: string;
};
function UploadButton(props: { onUploadSuccess: Function; children: React.ReactElement }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { currentStorage, prefix } = useStorageStore();
  const { showSuccess, showError } = useGlobalStore();
  const { uploadFile } = useAwsS3();
  const [fileList, setFileList] = React.useState<TFileItem[]>([]);
  const { t } = useTranslation();
  const darkMode = useColorMode().colorMode === "dark";
  const { onUploadSuccess, children } = props;
  const [failedFileList, setFailedFileList] = React.useState<any>([]);

  const handleUpload = async (files: any) => {
    setFailedFileList([]);
    const newFileList = Array.from(files).map((item: any) => ({
      fileName:
        files[0] instanceof File
          ? item.webkitRelativePath
            ? item.webkitRelativePath.replace(/^[^/]*\//, "")
            : item.name
          : item.webkitRelativePath
          ? item.webkitRelativePath
          : item.file.name,
      status: "pending",
    }));
    setFileList(newFileList);
    const tasks = [];
    const failedFiles: any[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[0] instanceof File ? files[i] : files[i].file;
      const fileName =
        files[0] instanceof File
          ? file.webkitRelativePath
            ? file.webkitRelativePath.replace(/^[^/]*\//, "")
            : file.name
          : files[i].webkitRelativePath
          ? files[i].webkitRelativePath
          : file.name;
      const task = uploadFile(currentStorage?.name!, prefix + fileName, file, {
        contentType: file.type,
      })
        .then(() => {
          setFileList((pre) => {
            const newList = [...pre];
            newList[i].status = "success";
            return newList;
          });
          return true;
        })
        .catch(() => {
          setFileList((pre) => {
            const newList = [...pre];
            newList[i].status = "fail";
            failedFiles.push(files[i]);
            return newList;
          });
          return false;
        });
      tasks.push(task);
    }
    const res = await Promise.all(tasks);
    onUploadSuccess();
    if (!res.includes(false)) {
      onClose();
      showSuccess(t("StoragePanel.Success"));
    } else {
      setFailedFileList(failedFiles);
      showError(t("StoragePanel.Fail"));
    }
  };

  return (
    <div>
      {React.cloneElement(children, {
        onClick: () => {
          setFileList([]);
          setFailedFileList([]);
          onOpen();
        },
      })}

      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t("StoragePanel.UploadFile")}</ModalHeader>
          <ModalCloseButton />
          <div className="p-6">
            <FileUpload onUpload={handleUpload} darkMode={darkMode} />
            {!!failedFileList.length && (
              <div className="mx-4 mt-4 flex justify-between text-lg text-red-500">
                <Trans
                  t={t}
                  i18nKey="StoragePanel.UploadFailTip"
                  values={{
                    number: failedFileList.length,
                  }}
                />
                <Button
                  variant="link"
                  className="!text-blue-600"
                  onClick={() => {
                    handleUpload(failedFileList);
                  }}
                >
                  {t("Retry")}
                </Button>
              </div>
            )}
            <div className="mt-2 max-h-40 overflow-auto">
              {fileList.map((item) => {
                return (
                  <div
                    key={item.fileName}
                    className={clsx(
                      "my-2 flex h-10 w-full items-center justify-between px-5",
                      darkMode ? "hover:bg-lafDark-300" : "hover:bg-slate-100",
                    )}
                  >
                    <span className="text-slate-500">{item.fileName}</span>
                    {item.status === "success" && (
                      <CheckCircleIcon color="green.500" fontSize={20} />
                    )}
                    {item.status === "pending" && <Spinner size="xs" className="mr-1" />}
                    {item.status === "fail" && (
                      <WarningIcon className="!text-red-400" fontSize={20} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </ModalContent>
      </Modal>
    </div>
  );
}

export default UploadButton;
