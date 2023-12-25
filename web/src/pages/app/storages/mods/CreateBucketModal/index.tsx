import React from "react";
import { useForm } from "react-hook-form";
import { InfoOutlineIcon } from "@chakra-ui/icons";
import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  InputAddon,
  InputGroup,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  useColorMode,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import clsx from "clsx";
import { t } from "i18next";

import { BUCKET_POLICY_TYPE } from "@/constants";

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

  const darkMode = useColorMode().colorMode === "dark";

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

  const { showSuccess, currentApp } = useGlobalStore();

  const isEdit = !!storage;

  const onSubmit = async (values: any) => {
    let res: any = {};
    if (isEdit) {
      res = await bucketUpdateMutation.mutateAsync(values);
      if (!res.error) {
        store.setCurrentStorage(res.data);
        showSuccess(t("UpdateSuccess"));
        onClose();
      }
    } else {
      res = await bucketCreateMutation.mutateAsync({
        shortName: values.name,
        policy: values.policy,
      });
      if (!res.error) {
        store.setCurrentStorage(res.data);
        showSuccess(t("CreateSuccess"));
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
                <InputGroup>
                  {!isEdit && (
                    <InputAddon className="!mr-0 !rounded-r-none !pr-0">
                      {currentApp.appid + "-"}
                    </InputAddon>
                  )}
                  <Input
                    {...register("name", {
                      required: t("StoragePanel.BucketNameisRequired").toString(),
                      pattern: {
                        value: /^[a-z0-9][a-z0-9-]{1,30}[a-z0-9]$/,
                        message: t("StoragePanel.BucketNameRule"),
                      },
                    })}
                    variant="filled"
                    placeholder={String(t("StoragePanel.BucketNamePlaceholder"))}
                    disabled={isEdit}
                    className={clsx(
                      "!rounded-l-none !border-none",
                      darkMode ? "!bg-[#FFFFFF0A]" : "!bg-lafWhite-600",
                      isEdit ? "" : "!ml-0 !pl-0",
                    )}
                  />
                </InputGroup>
                <FormErrorMessage>{errors.name && errors.name.message}</FormErrorMessage>
              </FormControl>

              <FormControl>
                <FormLabel htmlFor="policy">{t("StoragePanel.Policy")}</FormLabel>
                <Select {...register("policy", { required: true })} variant="filled">
                  <option value={BUCKET_POLICY_TYPE.private}>{t("StoragePanel.Private")}</option>
                  <option value={BUCKET_POLICY_TYPE.readonly}>{t("StoragePanel.Readonly")}</option>
                  <option value={BUCKET_POLICY_TYPE.readwrite}>
                    {t("StoragePanel.ReadWrite")}
                  </option>
                </Select>
              </FormControl>

              <span className="flex items-center text-grayModern-600">
                <InfoOutlineIcon className="mx-1" />
                {t("StoragePanel.BucketTips")}
              </span>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button
              type="submit"
              onClick={handleSubmit(onSubmit)}
              isLoading={bucketUpdateMutation.isLoading || bucketCreateMutation.isLoading}
            >
              {t("Confirm")}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export default CreateBucketModal;
