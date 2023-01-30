import React from "react";
import { useForm } from "react-hook-form";
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
  Select,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import { t } from "i18next";

import { useBucketCreateMutation, useBucketUpdateMutation } from "../../service";
import useStorageStore from "../../store";

import { TBucket } from "@/apis/typing";
import useGlobalStore from "@/pages/globalStore";

function CreateBucketModal(props: { storage?: TBucket; children: React.ReactElement }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const store = useStorageStore((store) => store);

  const { storage, children } = props;
  const bucketCreateMutation = useBucketCreateMutation();
  const bucketUpdateMutation = useBucketUpdateMutation();

  const defaultValues = {
    name: storage?.name,
    policy: storage?.policy,
  };

  const {
    register,
    handleSubmit,
    reset,
    setFocus,
    formState: { errors },
  } = useForm<{
    name: string;
    policy: string;
  }>({
    defaultValues,
  });

  const { showSuccess } = useGlobalStore();

  const isEdit = !!storage;

  const onSubmit = async (values: any) => {
    // debugger;
    let res: any = {};
    if (isEdit) {
      res = await bucketUpdateMutation.mutateAsync(values);

      if (!res.error) {
        store.setCurrentStorage(res.data);
        showSuccess("update success.");
        onClose();
      }
    } else {
      res = await bucketCreateMutation.mutateAsync({
        shortName: values.name,
        policy: values.policy,
      });
      if (!res.error) {
        store.setCurrentStorage(res.data);
        showSuccess("create success.");
        onClose();
      }
    }
  };

  return (
    <>
      {React.cloneElement(children, {
        onClick: () => {
          onOpen();
          reset(defaultValues);
          setTimeout(() => {
            setFocus("name");
          }, 0);
        },
      })}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {isEdit ? t("StoragePanel.EditBucket") : t("StoragePanel.CreateBucket")}
          </ModalHeader>
          <ModalCloseButton />

          <ModalBody pb={6}>
            <VStack spacing={6} align="flex-start">
              <FormControl isInvalid={!!errors?.name}>
                <FormLabel htmlFor="name"> {t("StoragePanel.BucketName")}</FormLabel>
                <Input
                  {...register("name", {
                    required: true,
                    pattern: {
                      value: /^[a-z][a-z0-9-]+[a-z]$/,
                      message: t("StoragePanel.BucketNameRule"),
                    },
                  })}
                  placeholder={String(t("StoragePanel.BucketNamePlaceholder"))}
                  variant="filled"
                  disabled={isEdit}
                />
                <FormErrorMessage>{errors.name && errors.name.message}</FormErrorMessage>
              </FormControl>

              <FormControl>
                <FormLabel htmlFor="policy">{t("StoragePanel.Policy")}</FormLabel>
                <Select {...register("policy", { required: true })} variant="filled">
                  <option value="private">{t("StoragePanel.Private")}</option>
                  <option value="readonly">{t("StoragePanel.Readonly")}</option>
                  <option value="readwrite">{t("StoragePanel.ReadWrite")}</option>
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button type="submit" onClick={handleSubmit(onSubmit)}>
              {t("Confirm")}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export default CreateBucketModal;
