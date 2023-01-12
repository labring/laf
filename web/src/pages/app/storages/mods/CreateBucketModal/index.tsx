import React from "react";
import { useForm } from "react-hook-form";
import {
  Button,
  FormControl,
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
    shortName: storage?.metadata.name,
    policy: storage?.spec.policy,
  };

  const { register, handleSubmit, reset, setFocus } = useForm<{
    shortName: string;
    policy: string;
  }>({
    defaultValues,
  });

  const { showSuccess } = useGlobalStore();

  const isEdit = !!storage;

  const onSubmit = async (values: any) => {
    let res: any = {};
    if (isEdit) {
      res = await bucketUpdateMutation.mutateAsync({
        name: values.shortName,
        ...values,
        storage: "1Gi",
      });

      if (!res.error) {
        store.setCurrentStorage(res.data);
        showSuccess("update success.");
        onClose();
      }
    } else {
      res = await bucketCreateMutation.mutateAsync({ ...values, storage: "1Gi" });
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
          <ModalHeader>{isEdit ? "编辑 Bucket" : "新建 Bucket"}</ModalHeader>
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
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button type="submit" onClick={handleSubmit(onSubmit)}>
              {isEdit ? "确定更新" : "确定创建"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export default CreateBucketModal;
