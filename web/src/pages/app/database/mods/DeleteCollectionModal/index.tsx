import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
  Button,
  FormControl,
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

import { RecycleDeleteIcon } from "@/components/CommonIcon";
import IconText from "@/components/IconText";

import { useDeleteDBMutation } from "../../service";

import useGlobalStore from "@/pages/globalStore";
function DeleteCollectionModal(props: { database: any }) {
  const { database } = props;
  const { t } = useTranslation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const deleteDBMutation = useDeleteDBMutation({
    onSuccess() {
      onClose();
    },
  });
  const { showError } = useGlobalStore();

  const { register, handleSubmit, setFocus, reset, setValue } = useForm<{
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
        icon={<RecycleDeleteIcon fontSize={16} />}
        text={t("Delete")}
        className="hover:!text-error-600"
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
              {t("DeleteTip")}
            </p>
            <p className="mb-4">
              {t("CollectionPanel.InputName")}
              <span className="mx-1 font-bold text-red-500">{database.name}</span>
              {t("ToConfirm")}
            </p>
            <FormControl>
              <Input
                {...register("name")}
                id="name"
                placeholder={database?.name}
                onChange={(e) => {
                  setValue("name", e.target.value.trim());
                }}
              />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button
              isLoading={deleteDBMutation.isLoading}
              onClick={handleSubmit(async (data) => {
                if (data.name !== database.name) {
                  showError(t("NameNotMatch"));
                  return;
                } else {
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
