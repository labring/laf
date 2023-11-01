import React from "react";
import { useTranslation } from "react-i18next";
import { CheckCircleIcon, WarningIcon } from "@chakra-ui/icons";
import {
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
  const { showSuccess } = useGlobalStore();
  const { uploadFile } = useAwsS3();
  const [fileList, setFileList] = React.useState<TFileItem[]>([]);
  const { t } = useTranslation();
  const darkMode = useColorMode().colorMode === "dark";
  const { onUploadSuccess, children } = props;
  return (
    <div>
      {React.cloneElement(children, {
        onClick: () => {
          setFileList([]);
          onOpen();
        },
      })}

      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t("StoragePanel.UploadFile")}</ModalHeader>
          <ModalCloseButton />
          <div className="p-6">
            <FileUpload
              onUpload={async (files) => {
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
                    })
                    .catch(() => {
                      setFileList((pre) => {
                        const newList = [...pre];
                        newList[i].status = "fail";
                        return newList;
                      });
                    });

                  tasks.push(task);
                }
                await Promise.all(tasks);
                onUploadSuccess();
                onClose();
                showSuccess(t("StoragePanel.Success"));
              }}
              darkMode={darkMode}
            />
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
