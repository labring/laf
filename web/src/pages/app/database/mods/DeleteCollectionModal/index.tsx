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
      <div
        onClick={() => {
          reset();
          onOpen();
          setTimeout(() => {
            setFocus("name");
          }, 0);
        }}
      >
        <div className="text-grayModern-900 w-[20px] h-[20px] text-center">
          <DeleteIcon fontSize={12} />
        </div>
        <div className="text-grayIron-600">{t("Delete")}</div>
      </div>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t("CollectionPanel.DeleteCollection")}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <p className="mb-2">
              {t("CollectionPanel.DeleteCollectionTip")}
              <span className=" text-black mx-1 font-bold">{database.name}</span>
              {t("DeleteTip")}。
            </p>
            <p className="mb-4">
              {t("CollectionPanel.InputName")}
              <span className=" text-red-500 mx-1 font-bold">{database.name}</span>
              {t("ToConfirm")}。
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
              {t("Confirm")}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export default DeleteCollectionModal;
