import React from "react";
import { useTranslation } from "react-i18next";
import { CheckCircleIcon } from "@chakra-ui/icons";
import {
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from "@chakra-ui/react";

import FileUpload from "@/components/FileUpload";

import useStorageStore from "../../store";

import useAwsS3 from "@/hooks/useAwsS3";
import useGlobalStore from "@/pages/globalStore";

export type TFileItem = {
  status: boolean;
  fileName: string;
};
function UploadButton(props: { onUploadSuccess: Function; children: React.ReactElement }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { currentStorage, prefix } = useStorageStore();
  const { showSuccess } = useGlobalStore();
  const { uploadFile } = useAwsS3();
  const [fileList, setFileList] = React.useState<TFileItem[]>([]);
  const { t } = useTranslation();
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
                const newFileList = Array.from(files).map((item: any) => {
                  return {
                    fileName: item.webkitRelativePath ? item.webkitRelativePath : item.name,
                    status: false,
                  };
                });
                setFileList(newFileList);
                for (let i = 0; i < files.length; i++) {
                  const file = files[i];
                  const fileName = file.webkitRelativePath ? file.webkitRelativePath : file.name;
                  await uploadFile(currentStorage?.name!, prefix + fileName, file, {
                    contentType: file.type,
                  });
                  setFileList((pre) => {
                    const newList = [...pre];
                    newList[i].status = true;
                    return newList;
                  });
                }
                onUploadSuccess();
                onClose();
                showSuccess(t("StoragePanel.Success"));
              }}
            />
            <div className="mt-2 max-h-40 overflow-auto">
              {fileList.map((item) => {
                return (
                  <div
                    key={item.fileName}
                    className="my-2 flex h-10 w-full items-center justify-between px-5 hover:bg-slate-100"
                  >
                    <span className="text-slate-500">{item.fileName}</span>
                    {item.status ? <CheckCircleIcon color="green.500" fontSize={20} /> : ""}
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
