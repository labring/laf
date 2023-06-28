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
  useDisclosure,
} from "@chakra-ui/react";
import { t } from "i18next";

import CommonDiffEditor from "@/components/Editor/CommonDiffEditor";

import useFunctionStore from "../../../store";

import useFunctionCache from "@/hooks/useFunctionCache";
import useGlobalStore from "@/pages/globalStore";

export default function FetchButton(props: { children: React.ReactElement; functionCode: string }) {
  const { children, functionCode } = props;
  const functionCache = useFunctionCache();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const store = useFunctionStore((state) => state);
  const { currentFunction, updateFunctionCode, setIsFetchButtonClicked } = store;
  const { showSuccess } = useGlobalStore((state) => state);

  return (
    <>
      {children &&
        React.cloneElement(children, {
          onClick: () => {
            onOpen();
          },
        })}

      {isOpen ? (
        <Modal isOpen={isOpen} onClose={onClose} size="6xl" isCentered>
          <ModalOverlay />
          <ModalContent maxW={"80%"}>
            <ModalHeader>Code Diff</ModalHeader>
            <ModalCloseButton />
            <ModalBody borderBottom={"1px"} borderBottomColor="gray.200">
              <CommonDiffEditor
                modified={functionCode}
                original={functionCache.getCache(
                  currentFunction?._id,
                  currentFunction?.source?.code,
                )}
              />
            </ModalBody>

            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>
                {t("Cancel")}
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  updateFunctionCode(currentFunction, functionCode || "");
                  functionCache.setCache(currentFunction!._id, functionCode || "");
                  setIsFetchButtonClicked();
                  onClose();
                  showSuccess(t("FunctionPanel.FetchSuccess"));
                }}
              >
                {t("FunctionPanel.Restore")}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      ) : null}
    </>
  );
}
