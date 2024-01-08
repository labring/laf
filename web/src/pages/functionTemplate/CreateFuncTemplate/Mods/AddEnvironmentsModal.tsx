import React from "react";
import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useColorMode,
  useDisclosure,
} from "@chakra-ui/react";
import clsx from "clsx";
import { t } from "i18next";

import ENVEditor from "@/components/Editor/ENVEditor";

const AddEnvironmentsModal = (props: {
  children: React.ReactElement;
  environments: any[];
  setEnvironments: React.Dispatch<React.SetStateAction<any[]>>;
}) => {
  const { children = null, environments, setEnvironments } = props;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { colorMode } = useColorMode();

  return (
    <>
      {children &&
        React.cloneElement(children, {
          onClick: () => {
            onOpen();
          },
        })}
      <Modal isOpen={isOpen} onClose={onClose} size="2xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t("Template.AddEnvironmentVariables")}</ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <div
              className={clsx("min-h-[200px] flex-1 rounded", {
                "border-frostyNightfall-200": !(colorMode === "dark"),
              })}
            >
              <ENVEditor env={environments} setEnv={setEnvironments} showSwitch={false} />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              onClick={async () => {
                setEnvironments(environments);
                onClose();
              }}
            >
              {t("Confirm")}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default AddEnvironmentsModal;
