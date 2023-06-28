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

import IconText from "@/components/IconText";

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
      <IconText
        onClick={() => {
          reset();
          onOpen();
          setTimeout(() => {
            setFocus("name");
          }, 0);
        }}
        icon={<DeleteIcon />}
        text={t("Delete")}
      />

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t("CollectionPanel.DeleteCollection")}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <p className="mb-2">
              {t("CollectionPanel.DeleteCollectionTip")}
              <span className="mx-1 font-bold">{database.name}</span>
              {t("DeleteTip")}。
            </p>
            <p className="mb-4">
              {t("CollectionPanel.InputName")}
              <span className="mx-1 font-bold text-red-500">{database.name}</span>
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
              isLoading={deleteDBMutation.isLoading}
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
