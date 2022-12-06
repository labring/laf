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
import useGlobalStore from "pages/globalStore";

import IconWrap from "@/components/IconWrap";

import useDBMStore from "../../store";

function DeleteCollectionModal(props: { database: any }) {
  const { database } = props;
  const { deleteDB, initDBPage } = useDBMStore((state) => state);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const { showSuccess } = useGlobalStore();

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
        tooltip="删除"
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
          <ModalHeader>删除集合</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <p className="mb-2">
              This action cannot be undone. This will permanently delete the{" "}
              <span className=" text-black mr-1 font-bold">{database.name}</span>
              storage,
            </p>
            <p className="mb-4">
              Please type <span className=" text-red-500 mr-1 font-bold">{database.name}</span> to
              confirm.
            </p>
            <FormControl>
              <Input
                {...register("name", {
                  required: "name is required",
                })}
                id="name"
                placeholder={database?.name}
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
                if (data.name === database.name) {
                  const res = await deleteDB(database.name);
                  if (!res.error) {
                    showSuccess("delete success");
                    initDBPage();
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

export default DeleteCollectionModal;
