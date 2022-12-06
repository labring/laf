import React from "react";
import { useForm } from "react-hook-form";
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
import { t } from "@lingui/macro";
import useGlobalStore from "pages/globalStore";

import IconWrap from "@/components/IconWrap";

import useStorageStore, { TStorage } from "../../store";

function CreateBucketModal(props: { storage?: TStorage }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { createStorage, updateStorage, initStoragePage } = useStorageStore((state) => state);

  const { storage } = props;

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
      res = await updateStorage(values);
      if (!res.error) {
        showSuccess("update success.");
        onClose();
        initStoragePage();
      }
    } else {
      res = await createStorage(values);
      if (!res.error) {
        showSuccess("create success.");
        onClose();
        initStoragePage();
      }
    }
  };

  return (
    <>
      <IconWrap
        size={20}
        onClick={() => {
          onOpen();
          reset(defaultValues);
          setTimeout(() => {
            setFocus("shortName");
          }, 0);
        }}
        tooltip="创建 Bucket"
      >
        {isEdit ? <EditIcon fontSize={13} /> : <AddIcon fontSize={10} />}
      </IconWrap>

      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create Bucket</ModalHeader>
          <ModalCloseButton />

          <ModalBody pb={6}>
            <VStack spacing={6} align="flex-start">
              <FormControl>
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

              <FormControl>
                <FormLabel htmlFor="storage">容量</FormLabel>
                <InputGroup>
                  <Input
                    {...register("storage", { required: true })}
                    type="number"
                    variant="filled"
                    className="w-1"
                  />
                  <InputRightElement children="GB" />
                </InputGroup>
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="primary" mr={3} type="submit" onClick={handleSubmit(onSubmit)}>
              {t`Confirm`}
            </Button>
            <Button onClick={onClose}>{t`Cancel`}</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export default CreateBucketModal;
