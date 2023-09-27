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

// import { DeleteIcon } from "@chakra-ui/icons";
import { RecycleDeleteIcon } from "@/components/CommonIcon";
import IconText from "@/components/IconText";

import { useBucketDeleteMutation } from "../../service";

import { TBucket } from "@/apis/typing";
import useGlobalStore from "@/pages/globalStore";
function DeleteBucketModal(props: { storage: TBucket; onSuccessAction?: () => void }) {
  const { storage, onSuccessAction } = props;
  const { showError } = useGlobalStore();

  const bucketDeleteMutation = useBucketDeleteMutation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { t } = useTranslation();
  const { register, handleSubmit, setFocus, reset, setValue } = useForm<{
    name: string;
  }>();

  return (
    <>
      <IconText
        icon={<RecycleDeleteIcon fontSize={16} />}
        text={t("Delete")}
        className="hover:!text-error-600"
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
              {t("DeleteTip")}
            </p>
            <p className="mb-4">
              {t("StoragePanel.StorageNameTip")}
              <span className="mx-1 font-bold text-red-500">{storage.name}</span>
              {t("ToConfirm")}
            </p>
            <FormControl>
              <Input
                {...register("name")}
                id="name"
                placeholder={storage?.name}
                onChange={(e) => {
                  setValue("name", e.target.value.trim());
                }}
              />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button
              isLoading={bucketDeleteMutation.isLoading}
              colorScheme="red"
              onClick={handleSubmit(async (data) => {
                if (data.name !== storage.name) {
                  showError(t("NameNotMatch"));
                } else {
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
