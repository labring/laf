import React from "react";
import { useNavigate } from "react-router-dom";
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
import { t } from "i18next";

import { changeURL } from "@/utils/format";

import FunctionTemplate from "@/pages/functionTemplate";

const FuncTemplate = (props: { children?: React.ReactElement }) => {
  const { onOpen, isOpen, onClose } = useDisclosure();
  const { children } = props;
  const navigate = useNavigate();

  const handleModalClose = () => {
    navigate(changeURL(`/function`));
    onClose();
  };
  return (
    <>
      {children &&
        React.cloneElement(children, {
          onClick: () => {
            onOpen();
          },
        })}

      <Modal isOpen={isOpen} onClose={handleModalClose}>
        <ModalOverlay />
        <ModalContent height={"95%"} maxW={"80%"} m={"auto"} overflowY={"auto"}>
          <ModalHeader pb={-0.5}>{t("HomePage.NavBar.funcTemplate")}</ModalHeader>
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
