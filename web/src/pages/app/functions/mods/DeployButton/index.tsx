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
import { Pages } from "@/constants";

import { useUpdateFunctionMutation } from "../../service";
import useFunctionStore from "../../store";

import useFunctionCache from "@/hooks/useFunctionCache";
import useHotKey, { DEFAULT_SHORTCUTS } from "@/hooks/useHotKey";
import useGlobalStore from "@/pages/globalStore";

export default function DeployButton() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const store = useFunctionStore((state) => state);
  const functionCache = useFunctionCache();

  const { showSuccess, currentPageId } = useGlobalStore((state) => state);

  const updateFunctionMutation = useUpdateFunctionMutation();

  const { displayName } = useHotKey(
    DEFAULT_SHORTCUTS.deploy,
    async () => {
      onOpen();
    },
    {
      enabled: currentPageId === Pages.function,
    },
  );

  const deploy = async () => {
    const res = await updateFunctionMutation.mutateAsync({
      description: store.currentFunction?.desc,
      code: functionCache.getCache(store.currentFunction!.id),
      methods: store.currentFunction?.methods,
      websocket: store.currentFunction?.websocket,
      name: store.currentFunction?.name,
      tags: store.currentFunction?.tags,
    });
    if (!res.error) {
      store.setCurrentFunction(res.data);
      // delete cache after deploy
      functionCache.removeCache(store.currentFunction!.id);
      onClose();
      showSuccess(t("Message.DeploySuccess"));
    }
  };

  return (
    <>
      <Button
        px={8}
        disabled={store.getFunctionUrl() === ""}
        colorScheme="blue"
        onClick={() => {
          onOpen();
        }}
      >
        {t("FunctionPanel.Deploy")} ({displayName.toUpperCase()})
      </Button>

      {isOpen ? (
        <Modal isOpen={isOpen} onClose={onClose} size="6xl" isCentered>
          <ModalOverlay />
          <ModalContent maxW={"80%"}>
            <ModalHeader>Code Diff</ModalHeader>
            <ModalCloseButton />
            <ModalBody borderBottom={"1px"} borderBottomColor="gray.200">
              <CommonDiffEditor
                original={store.currentFunction?.source?.code}
                modified={functionCache.getCache(store.currentFunction?.id)}
              />
            </ModalBody>

            <ModalFooter>
              <Button mr={3} onClick={onClose}>
                {t("Cancel")}
              </Button>
              <Button
                colorScheme={"blue"}
                onClick={() => {
                  deploy();
                }}
              >
                {t("Common.Dialog.ConfirmDeploy")}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      ) : null}
    </>
  );
}
