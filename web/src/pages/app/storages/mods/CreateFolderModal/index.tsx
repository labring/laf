import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { AiOutlineFolderAdd } from "react-icons/ai";
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
  useDisclosure,
  VStack,
} from "@chakra-ui/react";

import useStorageStore from "../../store";

import useAwsS3 from "@/hooks/useAwsS3";

function CreateModal({ onCreateSuccess }: { onCreateSuccess: () => void }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { prefix, currentStorage } = useStorageStore();
  const { register, setFocus, handleSubmit, reset } = useForm<{ prefix: string }>();
  const { uploadFile } = useAwsS3();
  const { t } = useTranslation();
  return (
    <>
      <Button
        size="xs"
        variant="textGhost"
        leftIcon={<AiOutlineFolderAdd fontSize={22} className="text-grayModern-500" />}
        disabled={currentStorage === undefined}
        onClick={() => {
          onOpen();
          reset({});
          setTimeout(() => {
            setFocus("prefix");
          }, 0);
        }}
      >
        {t("Create") + t("StoragePanel.Folder")}
      </Button>

      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader> {t("Create") + t("StoragePanel.Folder")}</ModalHeader>
          <ModalCloseButton />

          <ModalBody pb={6}>
            <VStack spacing={6} align="flex-start">
              <FormControl>
                <FormLabel htmlFor="prefix">{t("StoragePanel.FolderName")}</FormLabel>
                <Input
                  {...register("prefix", {
                    required: true,
                  })}
                  variant="filled"
                  placeholder={t("StoragePanel.NameTip").toString()}
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button
              type="submit"
              onClick={handleSubmit(async (value) => {
                await uploadFile(currentStorage?.name!, prefix + value.prefix + "/", null, {
                  contentType: "folder",
                });
                onCreateSuccess();
                // setPrefix(prefix + value.prefix + "/");
                onClose();
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

export default CreateModal;
