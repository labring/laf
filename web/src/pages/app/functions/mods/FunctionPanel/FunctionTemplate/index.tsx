import React from "react";
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalOverlay,
  useDisclosure,
} from "@chakra-ui/react";

import FunctionTemplate from "@/pages/functionTemplate";

const FuncTemplate = (props: { children?: React.ReactElement }) => {
  const { onOpen, isOpen, onClose } = useDisclosure();
  const { children } = props;
  return (
    <>
      {children &&
        React.cloneElement(children, {
          onClick: () => {
            onOpen();
          },
        })}

      <Modal isOpen={isOpen} onClose={onClose} size="7xl">
        <ModalOverlay />
        <ModalContent minH={"90%"} maxW={"90%"} m={"auto"}>
          <ModalBody>
            <ModalCloseButton />
            <FunctionTemplate isModal={true} />
          </ModalBody>
          <ModalFooter></ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default FuncTemplate;
