import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
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

import FileTypeIcon from "@/components/FileTypeIcon";

import useStorageStore from "../../store";

function CreateWebsiteModal({ onCreateSuccess }: { onCreateSuccess: () => void }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { currentStorage } = useStorageStore();
  const { register, setFocus, handleSubmit, reset } = useForm<{ label: string }>();

  const { t } = useTranslation();
  return (
    <>
      <Button
        size="xs"
        variant="textGhost"
        leftIcon={<FileTypeIcon type="website" />}
        disabled={currentStorage === undefined}
        onClick={() => {
          onOpen();
          reset({});
          setTimeout(() => {
            setFocus("label");
          }, 0);
        }}
      >
        网站托管
      </Button>

      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>创建网站托管</ModalHeader>
          <ModalCloseButton />

          <ModalBody pb={6}>
            <VStack spacing={6} align="flex-start">
              <FormControl>
                <FormLabel htmlFor="label">Label</FormLabel>
                <Input
                  {...register("label", {
                    required: true,
                  })}
                  variant="filled"
                  placeholder="请输入label"
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button
              type="submit"
              onClick={handleSubmit(async (value) => {
                onCreateSuccess();
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

export default CreateWebsiteModal;
