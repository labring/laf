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

import { useBucketDeleteMutation } from "../../service";

import { TBucket } from "@/apis/typing";
function DeleteBucketModal(props: { storage: TBucket; onSuccessAction?: () => void }) {
  const { storage, onSuccessAction } = props;

  const bucketDeleteMutation = useBucketDeleteMutation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { t } = useTranslation();
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
        icon={<DeleteIcon />}
        text={t("Delete")}
        onClick={() => {
          reset();
          onOpen();
          setTimeout(() => {
            setFocus("name");
          }, 0);
        }}
      />

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t("StoragePanel.DeleteBucket")}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <p className="mb-2">
              {t("StoragePanel.DeleteConfirm")}
              <span className=" mr-1 font-bold text-black">{" " + storage.name}</span>
              {t("DeleteTip")}。
            </p>
            <p className="mb-4">
              {t("StoragePanel.StorageNameTip")}
              <span className="mx-1 font-bold text-red-500">{storage.name}</span>
              {t("ToConfirm")}。
            </p>
            <FormControl>
              <Input
                {...register("name", {
                  required: "name is required",
                })}
                id="name"
                placeholder={storage?.name}
                variant="filled"
              />
              <FormErrorMessage>{errors.name && errors.name.message}</FormErrorMessage>
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button
              isLoading={bucketDeleteMutation.isLoading}
              colorScheme="red"
              onClick={handleSubmit(async (data) => {
                if (data.name === storage.name) {
                  const res = await bucketDeleteMutation.mutateAsync({ name: storage.name });
                  if (!res.error) {
                    onSuccessAction && onSuccessAction();
                    onClose();
                  }
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

export default DeleteBucketModal;
