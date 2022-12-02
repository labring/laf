import React, { forwardRef, useImperativeHandle, useState } from "react";
import { AddIcon } from "@chakra-ui/icons";
import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import { t } from "@lingui/macro";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useGlobalStore from "pages/globalStore";
import { ApplicationsControllerCreate } from "services/v1/applications";
import { useImmer } from "use-immer";

const initialAppInfo = {
  displayName: "",
  state: "Running",
  region: "default",
  bundleName: "mini",
  runtimeName: "node-laf",
};

const initialErrors = {
  displayName: "",
  state: "",
  region: "",
  bundleName: "",
  runtimeName: "",
};

const CreateAppModal = forwardRef((props, ref) => {
  const initialRef = React.useRef(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const queryClient = useQueryClient();

  const [appInfo, updateAppInfo] = useImmer(initialAppInfo);
  const [errors, updateErrors] = useImmer(initialErrors);
  const [isEdit, setIsEdit] = useState(false);

  const { showSuccess } = useGlobalStore();

  const appCreateMutaion = useMutation((params: any) => ApplicationsControllerCreate(params), {
    onSuccess: () => {
      onClose();

      setTimeout(() => {
        showSuccess("添加成功");

        updateAppInfo((draft) => {
          draft = initialAppInfo;
          return draft;
        });

        updateErrors((draft) => {
          draft = initialErrors;
          return draft;
        });
      }, 100);
      queryClient.invalidateQueries(["appListQuery"]);
    },
  });

  useImperativeHandle(ref, () => {
    return {
      edit: (item: any) => {
        setIsEdit(true);
        updateAppInfo((draft) => {
          draft = item;
          return draft;
        });
        onOpen();
      },
    };
  });

  return (
    <>
      <Button
        size={"lg"}
        colorScheme="primary"
        style={{ padding: "0 40px" }}
        leftIcon={<AddIcon />}
        onClick={() => {
          setIsEdit(false);
          onOpen();
        }}
      >
        {t`NewApplication`}
      </Button>

      <Modal initialFocusRef={initialRef} isOpen={isOpen} onClose={onClose} size="2xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>新建应用</ModalHeader>
          <ModalCloseButton />

          <ModalBody pb={6}>
            <VStack spacing={6} align="flex-start">
              <FormControl isRequired isInvalid={errors.displayName !== ""}>
                <FormLabel htmlFor="name">应用名称</FormLabel>
                <Input
                  ref={initialRef}
                  value={appInfo.displayName}
                  onChange={(e) => {
                    updateAppInfo((draft) => {
                      draft.displayName = e.target.value;
                    });

                    updateErrors((draft) => {
                      draft.displayName = "";
                    });
                  }}
                />
                <FormErrorMessage>{errors.displayName}</FormErrorMessage>
              </FormControl>

              <FormControl isRequired>
                <FormLabel htmlFor="id">Region</FormLabel>
                <Button variant={"solid"} colorScheme="green">
                  {appInfo.region}
                </Button>
              </FormControl>

              <FormControl isRequired isInvalid={errors.bundleName !== ""}>
                <FormLabel htmlFor="id">Bundle Name</FormLabel>
                <Input
                  disabled={isEdit}
                  value={appInfo.bundleName}
                  onChange={(e) => {
                    updateAppInfo((draft) => {
                      draft.bundleName = e.target.value;
                    });
                  }}
                />
                <FormErrorMessage>{errors.bundleName}</FormErrorMessage>
              </FormControl>

              <FormControl isRequired isInvalid={errors.runtimeName !== ""}>
                <FormLabel htmlFor="id">Runtime Name</FormLabel>
                <Input
                  disabled={isEdit}
                  value={appInfo.runtimeName}
                  onChange={(e) => {
                    updateAppInfo((draft) => {
                      draft.runtimeName = e.target.value;
                    });
                  }}
                />
                <FormErrorMessage>{errors.runtimeName}</FormErrorMessage>
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="primary"
              mr={3}
              isLoading={appCreateMutaion.isLoading}
              type="submit"
              onClick={() => {
                updateErrors((draft) => {
                  draft = initialErrors;
                  return draft;
                });

                if (appInfo.displayName.trim() === "") {
                  updateErrors((draft) => {
                    draft.displayName = "displayName is required";
                  });
                  return;
                }
                if (appInfo.bundleName.trim() === "") {
                  updateErrors((draft) => {
                    draft.bundleName = "bundleName is required";
                  });
                  return;
                }
                if (appInfo.runtimeName.trim() === "") {
                  updateErrors((draft) => {
                    draft.runtimeName = "runtimeName is required";
                  });
                  return;
                }
                appCreateMutaion.mutate(appInfo);
              }}
            >
              {t`Confirm`}
            </Button>
            <Button
              onClick={() => {
                onClose();
                updateErrors((draft) => {
                  draft = initialErrors;
                  return draft;
                });
              }}
            >{t`Cancel`}</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
});

CreateAppModal.displayName = "CreateModal";

export default CreateAppModal;
