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
  Tooltip,
  useDisclosure,
} from "@chakra-ui/react";
import { t } from "i18next";

import { SynchronizeUpIcon } from "@/components/CommonIcon";
import CommonDiffEditor from "@/components/Editor/CommonDiffEditor";
import { Pages } from "@/constants";

import { useFunctionDetailQuery, useUpdateFunctionMutation } from "../../service";
import useFunctionStore from "../../store";

import useFunctionCache from "@/hooks/useFunctionCache";
import useHotKey, { DEFAULT_SHORTCUTS } from "@/hooks/useHotKey";
import useGlobalStore from "@/pages/globalStore";

export default function DeployButton() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const store = useFunctionStore((state) => state);
  const functionCache = useFunctionCache();

  const headerRef = React.useRef(null);

  const { showSuccess, currentPageId } = useGlobalStore((state) => state);

  const updateFunctionMutation = useUpdateFunctionMutation();

  const functionDetailQuery = useFunctionDetailQuery(store.currentFunction.name, {
    enabled: isOpen,
  });

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
      code: functionCache.getCache(store.currentFunction!._id, store.currentFunction!.source?.code),
      methods: store.currentFunction?.methods,
      websocket: store.currentFunction?.websocket,
      name: store.currentFunction?.name,
      tags: store.currentFunction?.tags,
    });
    if (!res.error) {
      store.setCurrentFunction(res.data);
      // delete cache after deploy
      functionCache.removeCache(store.currentFunction!._id);
      onClose();
      showSuccess(t("FunctionPanel.DeploySuccess"));
    }
  };

  return (
    <>
      <Tooltip
        label={`快捷键: ${displayName.toUpperCase()}，调试可直接点击右侧「运行」按扭`}
        placement="bottom-end"
      >
        <Button
          variant={"text"}
          isLoading={functionDetailQuery.isFetching}
          disabled={store.getFunctionUrl() === ""}
          onClick={() => {
            onOpen();
          }}
          leftIcon={<SynchronizeUpIcon />}
        >
          {t("FunctionPanel.Deploy")}
        </Button>
      </Tooltip>

      {isOpen && !functionDetailQuery.isFetching ? (
        <Modal isOpen={isOpen} onClose={onClose} size="6xl" isCentered initialFocusRef={headerRef}>
          <ModalOverlay />
          <ModalContent maxW={"80%"}>
            <ModalHeader>Code Diff</ModalHeader>
            <ModalCloseButton />
            <ModalBody borderBottom={"1px"} borderBottomColor="gray.200">
              <CommonDiffEditor
                original={functionDetailQuery.data?.data?.source?.code}
                modified={functionCache.getCache(
                  store.currentFunction?._id,
                  store.currentFunction?.source?.code,
                )}
              />
            </ModalBody>

            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>
                {t("Cancel")}
              </Button>
              <Button
                ref={headerRef}
                variant="primary"
                isLoading={updateFunctionMutation.isLoading}
                onClick={() => {
                  deploy();
                }}
              >
                {t("FunctionPanel.ConfirmDeploy")}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      ) : null}
    </>
  );
}
