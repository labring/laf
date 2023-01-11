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

import { useDeleteDBMutation } from "../../service";

function DeleteCollectionModal(props: { database: any }) {
  const { database } = props;
  const { t } = useTranslation();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const deleteDBMutation = useDeleteDBMutation({
    onSuccess() {
      onClose();
    },
  });

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
              当前操作将永久删除集合
              <span className=" text-black mr-1 font-bold">{database.name}</span>
              ,无法撤销。
            </p>
            <p className="mb-4">
              请输入集合名称 <span className=" text-red-500 mr-1 font-bold">{database.name}</span>
              进行确定。
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
              onClick={handleSubmit(async (data) => {
                if (data.name === database.name) {
                  await deleteDBMutation.mutateAsync({ name: database.name });
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

export default DeleteCollectionModal;
