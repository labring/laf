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

import { useFunctionDetailQuery } from "../../service";
import useFunctionStore from "../../store";

import useFunctionCache from "@/hooks/useFunctionCache";
import useGlobalStore from "@/pages/globalStore";

export default function FetchButton() {
  const functionCache = useFunctionCache();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const store = useFunctionStore((state) => state);
  const { currentFunction, updateFunctionCode, setIsFetchButtonClicked } = store;
  const functionDetailQuery = useFunctionDetailQuery(store.currentFunction.name, {
    enabled: isOpen,
  });
  const data = functionDetailQuery.data?.data?.source?.code;
  const { showSuccess } = useGlobalStore((state) => state);

  return (
    <>
      <Button
        variant={"text"}
        isLoading={functionDetailQuery.isFetching}
        disabled={store.getFunctionUrl() === ""}
        onClick={() => {
          onOpen();
        }}
      >
        {t("FunctionPanel.Fetch")}
      </Button>

      {isOpen && !functionDetailQuery.isFetching ? (
        <Modal isOpen={isOpen} onClose={onClose} size="6xl" isCentered>
          <ModalOverlay />
          <ModalContent maxW={"80%"}>
            <ModalHeader>Code Diff</ModalHeader>
            <ModalCloseButton />
            <ModalBody borderBottom={"1px"} borderBottomColor="gray.200">
              <CommonDiffEditor
                modified={data}
                original={functionCache.getCache(
                  currentFunction?.id,
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
                  updateFunctionCode(currentFunction, data || "");
                  functionCache.setCache(currentFunction!.id, data || "");
                  setIsFetchButtonClicked();
                  onClose();
                  showSuccess(t("FunctionPanel.FetchSuccess"));
                }}
              >
                {t("FunctionPanel.ConfirmFetch")}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      ) : null}
    </>
  );
}
