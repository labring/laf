import React, { useRef } from "react";
import { useController, useForm } from "react-hook-form";
import { FiFile } from "react-icons/fi";
import { ChevronDownIcon } from "@chakra-ui/icons";
import {
  Button,
  FormControl,
  FormLabel,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
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

const FileUploadForm = ({ name, acceptedFileTypes, children, isRequired = false }: any) => {
  const inputRef = useRef();
  const { control } = useForm();

  const {
    field: { ref, value, ...inputProps },
  } = useController({
    name,
    control,
    rules: { required: isRequired },
  });

  console.log("inputProps", inputProps);

  return (
    <FormControl isRequired>
      <FormLabel htmlFor="writeUpFile">{children}</FormLabel>
      <InputGroup>
        <InputLeftElement pointerEvents="none" children={<Icon as={FiFile} />} />
        <input
          type="file"
          accept={acceptedFileTypes}
          name={name}
          ref={inputRef}
          {...inputProps}
          inputRef={ref}
          webkitdirectory
          directory
          multiple
          style={{ display: "none" }}
        ></input>
        <Input onClick={() => inputRef.current.click()} value={value} />
      </InputGroup>
    </FormControl>
  );
};

function FileUpload() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const initialRef = React.useRef(null);

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

      <Modal initialFocusRef={initialRef} isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Upload File</ModalHeader>
          <ModalCloseButton />
          <div className="p-6">
            {FileUploadForm({ name: "writeUpFile", acceptedFileTypes: "*", children: "上传文件" })}
          </div>
        </ModalContent>
      </Modal>
    </>
  );
}

export default FileUpload;
