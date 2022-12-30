import React from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { DeleteIcon } from "@chakra-ui/icons";
import {
  Button,
  FormControl,
  FormErrorMessage,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from "@chakra-ui/react";

import IconWrap from "@/components/IconWrap";

import { useBucketDeleteMutation } from "../../service";
function DeleteBucketModal(props: { storage: any; onSuccessAction?: () => void }) {
  const { storage, onSuccessAction } = props;

  const bucketDeleteMutation = useBucketDeleteMutation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    setFocus,
    reset,
    formState: { errors },
  } = useForm<{
    name: string;
  }>();

  return (
    <>
      <IconWrap
        tooltip="删除Bucket"
        onClick={() => {
          reset();
          onOpen();
          setTimeout(() => {
            setFocus("name");
          }, 0);
        }}
      >
        <DeleteIcon fontSize={12} />
      </IconWrap>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>删除 storage</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <p className="mb-2">
              当前操作将会永久删除云存储
              <span className=" text-black mr-1 font-bold">{storage.metadata.name}</span>
              ,无法撤销。
            </p>
            <p className="mb-4">
              请输入云存储名称
              <span className=" text-red-500 mr-1 font-bold">{storage.metadata.name}</span>
              进行确定。
            </p>
            <FormControl>
              <Input
                {...register("name", {
                  required: "name is required",
                })}
                id="name"
                placeholder={storage?.metadata.name}
                variant="filled"
              />
              <FormErrorMessage>{errors.name && errors.name.message}</FormErrorMessage>
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button mr={3} onClick={onClose}>
              {t("Common.Dialog.Cancel")}
            </Button>
            <Button
              colorScheme="red"
              onClick={handleSubmit(async (data) => {
                if (data.name === storage.metadata.name) {
                  const res = await bucketDeleteMutation.mutateAsync({
                    name: storage.metadata.name,
                    ...storage,
                  });
                  if (!res.error) {
                    onSuccessAction && onSuccessAction();
                    onClose();
                  }
                }
              })}
            >
              {t("Common.Dialog.Confirm")}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export default DeleteBucketModal;
