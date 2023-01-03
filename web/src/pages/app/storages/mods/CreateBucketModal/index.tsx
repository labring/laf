import React from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
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

import { useBucketCreateMutation, useBucketUpdateMutation } from "../../service";
import useStorageStore from "../../store";

import { TBucket } from "@/apis/typing";
import useGlobalStore from "@/pages/globalStore";

function CreateBucketModal(props: { storage?: TBucket; children: React.ReactElement }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { t } = useTranslation();
  const store = useStorageStore((store) => store);

  const { storage, children } = props;
  const bucketCreateMutation = useBucketCreateMutation();
  const bucketUpdateMutation = useBucketUpdateMutation();

  const defaultValues = {
    shortName: storage?.metadata.name,
    policy: storage?.spec.policy,
    storage: parseInt(storage?.spec.storage || "", 10),
  };

  const maxStorage = store.maxStorage + (defaultValues.storage || 0);
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
      {React.cloneElement(children, {
        onClick: () => {
          onOpen();
          reset(defaultValues);
          setTimeout(() => {
            setFocus("shortName");
          }, 0);
        },
      })}
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
                <FormLabel htmlFor="storage">容量（最大容量{maxStorage}GB）</FormLabel>
                <InputGroup>
                  <Input
                    {...register("storage", {
                      required: true,
                      max: maxStorage,
                      min: 0,
                    })}
                    type="number"
                    min="0"
                    max={maxStorage}
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
              disabled={maxStorage === 0}
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
