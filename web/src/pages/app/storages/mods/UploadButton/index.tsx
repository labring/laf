import React from "react";
import { ChevronDownIcon } from "@chakra-ui/icons";
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

function UploadButton({onUploadSuccess}: {onUploadSuccess: () => void}) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { currentStorage, prefix } = useStorageStore();
  const { showSuccess } = useGlobalStore();
  const { uploadFile } = useAwsS3();
  const [uploadType, setUploadType] = React.useState<"file" | "folder">("file");

  return (
    <div>
      <Menu placement="bottom-start">
        <MenuButton size="xs" as={Button} rightIcon={<ChevronDownIcon />}>
          上传
        </MenuButton>
        <MenuList>
          <MenuItem onClick={() => {
            setUploadType("file");
            onOpen();
          }}>上传文件</MenuItem>
          <MenuItem onClick={() => {
            setUploadType("folder");
            onOpen();
          }}>上传文件夹</MenuItem>
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
                for (let i = 0; i < files.length; i++) {
                  const file = files[i];
                  const fileName = file.webkitRelativePath ? file.webkitRelativePath : file.name;
                  await uploadFile(currentStorage?.metadata.name!, prefix + fileName, file, {
                    contentType: file.type,
                  });
                }

                onUploadSuccess();
                onClose();
                showSuccess("上传成功");
              }}
            />
          </div>
        </ModalContent>
      </Modal>
    </div>
  );
}

export default UploadButton;
