import React from "react";
import { CheckCircleIcon, ChevronDownIcon } from "@chakra-ui/icons";
import {
  Button,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from "@chakra-ui/react";

import FileUpload from "@/components/FileUplaod";

import useStorageStore from "../../store";

import useAwsS3 from "@/hooks/useAwsS3";
import useGlobalStore from "@/pages/globalStore";

export type TFileItem = {
  status: boolean;
  fileName: string;
};
function UploadButton({ onUploadSuccess }: { onUploadSuccess: () => void }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { currentStorage, prefix } = useStorageStore();
  const { showSuccess } = useGlobalStore();
  const { uploadFile } = useAwsS3();
  const [uploadType, setUploadType] = React.useState<"file" | "folder">("file");
  const [fileList, setFileList] = React.useState<TFileItem[]>([]);
  return (
    <div>
      <Menu placement="bottom-start">
        <MenuButton
          size="xs"
          as={Button}
          rightIcon={<ChevronDownIcon />}
          disabled={currentStorage === undefined}
        >
          上传
        </MenuButton>
        <MenuList>
          <MenuItem
            onClick={() => {
              setUploadType("file");
              setFileList([]);
              onOpen();
            }}
          >
            上传文件
          </MenuItem>
          <MenuItem
            onClick={() => {
              setUploadType("folder");
              setFileList([]);
              onOpen();
            }}
          >
            上传文件夹
          </MenuItem>
        </MenuList>
      </Menu>

      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Upload {uploadType === "file" ? "File" : "Folder"}</ModalHeader>
          <ModalCloseButton />
          <div className="p-6">
            <FileUpload
              uploadType={uploadType}
              onUpload={async (files) => {
                console.log(files);
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
                  await uploadFile(currentStorage?.metadata.name!, prefix + fileName, file, {
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
                showSuccess("上传成功");
              }}
            />
            <div className="mt-2 max-h-80 overflow-auto">
              {fileList.map((item) => {
                return (
                  <div
                    key={item.fileName}
                    className="my-2 px-5 flex w-full h-10 justify-between items-center hover:bg-slate-100"
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
