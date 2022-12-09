import React from "react";
import { useForm } from "react-hook-form";
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

import IconWrap from "@/components/IconWrap";

import { useCreateDBMutation } from "../../service";

const CreateCollectionModal = (props: { collection?: any }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const { collection } = props;

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
    onClose();
    reset({});
  };

  return (
    <>
      <IconWrap
        size={20}
        onClick={() => {
          onOpen();
          reset({});
          setTimeout(() => setFocus("name"), 0);
        }}
      >
        <AddIcon fontSize={10} />
      </IconWrap>

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>添加集合</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={6} align="flex-start">
              <FormControl isInvalid={!!errors?.name}>
                <FormLabel htmlFor="name">集合名称</FormLabel>
                <Input
                  {...register("name", {
                    required: "name is required",
                  })}
                  id="name"
                  variant="filled"
                  readOnly={isEdit}
                />
                <FormErrorMessage>{errors.name && errors.name.message}</FormErrorMessage>
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button
              isLoading={createDBMutation.isLoading}
              colorScheme="primary"
              mr={3}
              type="submit"
              onClick={handleSubmit(onSubmit)}
            >
              {t`Confirm`}
            </Button>
            <Button
              onClick={() => {
                onClose();
              }}
            >{t`Cancel`}</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

CreateCollectionModal.displayName = "CreateModal";

export default CreateCollectionModal;
