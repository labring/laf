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

function E() {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Menu>
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
              onUpload={(files) => {
                console.log(123, files);
              }}
            />
          </div>
        </ModalContent>
      </Modal>
    </>
  );
}

export default E;
