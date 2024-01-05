import React, { useRef } from "react";
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
import dotenv from "dotenv";
import { t } from "i18next";

import ENVEditor from "@/components/Editor/ENVEditor";

const convertToEnv = (tableData: any[]) => {
  if (!tableData) return "";
  return tableData.reduce((acc, { name, value }) => {
    return acc + `${name}="${value}"\n`;
  }, "");
};

const AddEnvironmentsModal = (props: {
  children?: React.ReactElement;
  environments?: any[];
  setEnvironments?: React.Dispatch<React.SetStateAction<any[]>>;
}) => {
  const { children = null, environments, setEnvironments } = props;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const envValue = useRef(convertToEnv([]));
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
              className={clsx("min-h-[200px] flex-1 rounded border", {
                "border-frostyNightfall-200": !(colorMode === "dark"),
              })}
            >
              <ENVEditor
                value={convertToEnv(environments || [])}
                height="200px"
                colorMode={colorMode}
                onChange={(value) => {
                  envValue.current = value;
                }}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              onClick={async () => {
                const obj = dotenv.parse(envValue.current || "");
                const arr = Object.keys(obj).map((key) => {
                  return { name: key, value: obj[key] };
                });
                if (setEnvironments) {
                  setEnvironments(arr);
                }
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
