import React from "react";
import { useDisclosure } from "@chakra-ui/hooks";
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react";

const SponsorModal = (props: { children: any }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { children } = props;
  return (
    <>
      {React.cloneElement(children, {
        onClick: (event?: any) => {
          event?.preventDefault();
          onOpen();
        },
      })}

      <Modal isOpen={isOpen} onClose={onClose} size="2xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Sponsor</ModalHeader>
          <ModalCloseButton />

          <ModalBody></ModalBody>

          <ModalFooter></ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default SponsorModal;
