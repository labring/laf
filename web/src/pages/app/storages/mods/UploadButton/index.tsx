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

function UploadButton() {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const { currentStorage } = useStorageStore();

  const { uploadFile } = useAwsS3();

  return (
    <div>
      <Menu placement="bottom-start">
        <MenuButton size="xs" as={Button} rightIcon={<ChevronDownIcon />}>
          上传
        </MenuButton>
        <MenuList>
          <MenuItem onClick={onOpen}>上传文件</MenuItem>
          <MenuItem>上传文件夹</MenuItem>
        </MenuList>
      </Menu>

      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Upload File</ModalHeader>
          <ModalCloseButton />
          <div className="p-6">
            <FileUpload
              onUpload={async (files) => {
                for (let i = 0; i < files.length; i++) {
                  await uploadFile(currentStorage?.metadata.name!, "/" + files[i].name, files[i], {
                    contentType: files[i].type,
                  });
                }
                console.log("success");
                return files;
              }}
            />
          </div>
        </ModalContent>
      </Modal>
    </div>
  );
}

export default UploadButton;
