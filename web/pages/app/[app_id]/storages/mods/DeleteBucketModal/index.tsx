import React from "react";
import { useForm } from "react-hook-form";
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

function DeleteBucketModal(props: { storage: any }) {
  const { storage } = props;

  const bucketDeleteMutation = useBucketDeleteMutation();

  const { isOpen, onOpen, onClose } = useDisclosure();

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
              This action cannot be undone. This will permanently delete the{" "}
              <span className=" text-black mr-1 font-bold">{storage.metadata.name}</span>
              storage,
            </p>
            <p className="mb-4">
              Please type{" "}
              <span className=" text-red-500 mr-1 font-bold">{storage.metadata.name}</span> to
              confirm.
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
            <Button
              colorScheme="red"
              mr={3}
              onClick={handleSubmit(async (data) => {
                if (data.name === storage.metadata.name) {
                  const res = await bucketDeleteMutation.mutateAsync({
                    name: storage.metadata.name,
                    ...storage,
                  });
                  if (!res.error) {
                    onClose();
                  }
                }
              })}
            >
              Save
            </Button>
            <Button onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export default DeleteBucketModal;
