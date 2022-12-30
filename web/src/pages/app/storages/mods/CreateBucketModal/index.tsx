import React from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { AddIcon, EditIcon } from "@chakra-ui/icons";
import {
  Button,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
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

import IconWrap from "@/components/IconWrap";

import { useBucketCreateMutation, useBucketUpdateMutation } from "../../service";
import useStorageStore from "../../store";

import { TBucket } from "@/apis/typing";
import useGlobalStore from "@/pages/globalStore";

function CreateBucketModal(props: { storage?: TBucket; showText?: boolean }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { t } = useTranslation();
  const store = useStorageStore((store) => store);

  const { storage, showText } = props;
  const bucketCreateMutation = useBucketCreateMutation();
  const bucketUpdateMutation = useBucketUpdateMutation();

  const defaultValues = {
    shortName: storage?.metadata.name,
    policy: storage?.spec.policy,
    storage: parseInt(storage?.spec.storage || "", 10),
  };

  const { register, handleSubmit, reset, setFocus } = useForm<{
    shortName: string;
    policy: string;
    storage: number;
  }>({
    defaultValues,
  });

  const { showSuccess } = useGlobalStore();

  const isEdit = !!storage;

  const onSubmit = async (values: any) => {
    let res: any = {};
    values.storage = values.storage + "Gi";
    if (isEdit) {
      res = await bucketUpdateMutation.mutateAsync({
        name: values.shortName,
        ...values,
      });

      if (!res.error) {
        store.setCurrentStorage(res.data);
        showSuccess("update success.");
        onClose();
      }
    } else {
      res = await bucketCreateMutation.mutateAsync(values);

      if (!res.error) {
        store.setCurrentStorage(res.data);
        showSuccess("create success.");
        onClose();
      }
    }
  };

  return (
    <>
      {showText ? (
        <Button
          size="lg"
          variant="ghost"
          leftIcon={<AddIcon />}
          onClick={() => {
            onOpen();
            reset(defaultValues);
            setTimeout(() => {
              setFocus("shortName");
            }, 0);
          }}
        >
          创建 Bucket
        </Button>
      ) : (
        <IconWrap
          size={20}
          onClick={() => {
            onOpen();
            reset(defaultValues);
            setTimeout(() => {
              setFocus("shortName");
            }, 0);
          }}
          tooltip={isEdit ? "编辑 Bucket" : "创建 Bucket"}
        >
          {isEdit ? <EditIcon fontSize={13} /> : <AddIcon fontSize={10} />}
        </IconWrap>
      )}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{isEdit ? "编辑 Bucket" : "创建 Bucket"}</ModalHeader>
          <ModalCloseButton />

          <ModalBody pb={6}>
            <VStack spacing={6} align="flex-start">
              <FormControl isRequired>
                <FormLabel htmlFor="shortName">Bucket名称</FormLabel>
                <Input
                  {...register("shortName", { required: true })}
                  variant="filled"
                  disabled={isEdit}
                />
              </FormControl>

              <FormControl>
                <FormLabel htmlFor="policy">权限</FormLabel>
                <Select {...register("policy", { required: true })} variant="filled">
                  <option value="private">私有</option>
                  <option value="readonly">公共读</option>
                  <option value="readwrite">公共读写</option>
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel htmlFor="storage">
                  容量（最大容量
                  {defaultValues.storage
                    ? store.maxStorage + defaultValues.storage
                    : store.maxStorage}
                  GB）
                </FormLabel>
                <InputGroup>
                  <Input
                    {...register("storage", {
                      required: true,
                      max: defaultValues.storage
                        ? store.maxStorage + defaultValues.storage
                        : store.maxStorage,
                      min: 0,
                    })}
                    type="number"
                    min="0"
                    max={
                      defaultValues.storage
                        ? store.maxStorage + defaultValues.storage
                        : store.maxStorage
                    }
                    variant="filled"
                    className="w-1"
                  />
                  <InputRightElement children="GB" />
                </InputGroup>
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button mr={3} onClick={onClose}>
              {t("Common.Dialog.Cancel")}
            </Button>
            <Button
              disabled={
                (defaultValues.storage
                  ? store.maxStorage + defaultValues.storage
                  : store.maxStorage) === 0
              }
              colorScheme="blue"
              type="submit"
              onClick={handleSubmit(onSubmit)}
            >
              {t("Common.Dialog.Confirm")}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export default CreateBucketModal;
