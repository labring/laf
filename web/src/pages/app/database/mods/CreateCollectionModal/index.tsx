import React from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
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

import { useCreateDBMutation } from "../../service";
import useDBMStore from "../../store";
const CreateCollectionModal = (props: { collection?: any; children: React.ReactElement }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { t } = useTranslation();
  const store = useDBMStore();
  const { collection, children } = props;

  const isEdit = !!collection;

  type FormData = {
    name: string;
  };

  const {
    register,
    handleSubmit,
    setFocus,
    reset,
    formState: { errors },
  } = useForm<FormData>();

  const createDBMutation = useCreateDBMutation();

  const onSubmit = async (data: any) => {
    await createDBMutation.mutateAsync({ name: data.name });
    store.setCurrentDB(data);
    onClose();
    reset({});
  };

  return (
    <>
      {React.cloneElement(children, {
        onClick: () => {
          onOpen();
          reset({});
          setTimeout(() => setFocus("name"), 0);
        },
      })}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t("CollectionPanel.AddCollection")}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={6} align="flex-start">
              <FormControl isInvalid={!!errors?.name}>
                <FormLabel htmlFor="name">{t("CollectionPanel.CollectionName")}</FormLabel>
                <Input
                  {...register("name", {
                    required: "name is required",
                    pattern: {
                      value: /^[A-Za-z][A-Za-z0-9-_]+$/,
                      message: t("CollectionPanel.CollectionNameRule"),
                    },
                  })}
                  id="name"
                  variant="filled"
                  readOnly={isEdit}
                  placeholder={t("CollectionPanel.CollectionPlaceholder").toString()}
                />
                <FormErrorMessage>{errors.name && errors.name.message}</FormErrorMessage>
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button
              isLoading={createDBMutation.isLoading}
              type="submit"
              onClick={handleSubmit(onSubmit)}
            >
              {t("Confirm")}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

CreateCollectionModal.displayName = "CreateModal";

export default CreateCollectionModal;
