import { useForm } from "react-hook-form";
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
import { t } from "i18next";

import useStorageStore from "../../store";
// import useAwsS3 from "@/hooks/useAwsS3";

function CreateModal() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { prefix, setPrefix, currentStorage } = useStorageStore();
  const { register, setFocus, handleSubmit } = useForm<{ prefix: string }>();
  // const { uploadFile } = useAwsS3();
  return (
    <>
      <Button
        size="xs"
        disabled={currentStorage === undefined}
        onClick={() => {
          onOpen();
          setTimeout(() => {
            setFocus("prefix");
          }, 0);
        }}
      >
        新建文件夹
      </Button>

      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create Folder</ModalHeader>
          <ModalCloseButton />

          <ModalBody pb={6}>
            <VStack spacing={6} align="flex-start">
              <FormControl>
                <FormLabel htmlFor="prefix">文件夹名称</FormLabel>
                <Input
                  {...register("prefix", {
                    required: true,
                  })}
                  variant="filled"
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button mr={3} onClick={onClose}>
              {t("Common.Dialog.Cancel")}
            </Button>
            <Button
              colorScheme="primary"
              type="submit"
              onClick={handleSubmit(async (value) => {
                //await uploadFile(currentStorage?.metadata.name!, prefix + value.prefix + "/", '', { contentType: "folder" });
                // query.refetch();
                setPrefix(prefix + value.prefix + "/");
                onClose();
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

export default CreateModal;
