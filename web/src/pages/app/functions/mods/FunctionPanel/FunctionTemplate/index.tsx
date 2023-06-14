import React from "react";
import { useTranslation } from "react-i18next";
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from "@chakra-ui/react";

import FunctionTemplate from "@/pages/functionTemplate";

const FuncTemplate = (props: { children?: React.ReactElement }) => {
  const { onOpen, isOpen, onClose } = useDisclosure();
  const { children } = props;
  const { t } = useTranslation();

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
        <ModalContent>
          <ModalHeader>{t("market.funcTemplate")}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FunctionTemplate />
          </ModalBody>
          <ModalFooter></ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default FuncTemplate;
