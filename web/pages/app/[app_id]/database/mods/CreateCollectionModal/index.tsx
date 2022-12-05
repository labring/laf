import React, { forwardRef, useEffect, useImperativeHandle, useState } from "react";
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
import useGlobalStore from "pages/globalStore";

import IconWrap from "@/components/IconWrap";

import useDBMStore from "../../store";

const CreateCollectionModal = forwardRef((props, ref) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { createDB } = useDBMStore((state) => state);

  const { showSuccess } = useGlobalStore();

  const [isEdit, setIsEdit] = useState(false);

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

  const onSubmit = async (data: any) => {
    await createDB(data.name);
    showSuccess("create success.");
    onClose();
    reset({});
  };

  useImperativeHandle(ref, () => {
    return {
      edit: (item: any) => {
        setIsEdit(true);
        onOpen();
        reset(item);
      },
    };
  });

  return (
    <>
      <IconWrap
        size={20}
        onClick={() => {
          setIsEdit(false);
          onOpen();
          setTimeout(() => {
            setFocus("name");
          }, 0);
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
            <Button colorScheme="primary" mr={3} type="submit" onClick={handleSubmit(onSubmit)}>
              {t`Confirm`}
            </Button>
            <Button
              onClick={() => {
                onClose();
                reset();
              }}
            >{t`Cancel`}</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
});

CreateCollectionModal.displayName = "CreateModal";

export default CreateCollectionModal;
