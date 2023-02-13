import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { DeleteIcon } from "@chakra-ui/icons";
import {
  Button,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputLeftAddon,
  InputRightAddon,
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

import CopyText from "@/components/CopyText";
import IconWrap from "@/components/IconWrap";

import {
  useWebsiteCreateMutation,
  useWebsiteDeleteMutation,
  useWebSiteUpdateMutation,
} from "../../service";
import useStorageStore from "../../store";

function CreateWebsiteModal() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { currentStorage } = useStorageStore();
  const { register, setFocus, handleSubmit, reset } = useForm<{ domain: string }>();
  const { t } = useTranslation();
  const createWebsiteMutation = useWebsiteCreateMutation();
  const deleteWebsiteMutation = useWebsiteDeleteMutation();
  const updateWebsiteMutation = useWebSiteUpdateMutation();
  return (
    <>
      {currentStorage?.websiteHosting && currentStorage.websiteHosting.state === "Active" ? (
        <>
          <span>{t("StoragePanel.nowDomain")}</span>
          <InputGroup
            onClick={() => {
              if (currentStorage?.websiteHosting?.state === "Active") {
                onOpen();
                reset({});
                setTimeout(() => {
                  setFocus("domain");
                }, 0);
              }
            }}
          >
            <InputLeftAddon
              children={
                <>
                  <span className="inline-block w-[6px] h-[6px]  rounded-full mr-1 bg-primary-600"></span>
                  <span className="text-primary-600">
                    {currentStorage?.websiteHosting?.state === "Active"
                      ? t("StoragePanel.isResolved")
                      : t("StoragePanel.parsing")}
                  </span>
                </>
              }
            />
            <Input value={currentStorage?.websiteHosting?.domain} readOnly />
            <InputRightAddon
              onClick={(e) => {
                e.stopPropagation();
              }}
              children={
                <>
                  <CopyText text={currentStorage?.websiteHosting?.domain} />
                  <IconWrap tooltip={String(t("Delete"))}>
                    <DeleteIcon
                      fontSize={15}
                      onClick={() => {
                        deleteWebsiteMutation.mutateAsync({
                          id: currentStorage?.websiteHosting?.id,
                        });
                      }}
                    />
                  </IconWrap>
                </>
              }
            />
          </InputGroup>
        </>
      ) : (
        <Button
          size="xs"
          variant={"secondary"}
          disabled={currentStorage === undefined}
          onClick={() => {
            createWebsiteMutation.mutateAsync({
              bucketName: currentStorage && currentStorage.name,
              state: "Active",
            });
          }}
        >
          {t("StoragePanel.websiteHost")}
        </Button>
      )}

      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t("StoragePanel.bind")}</ModalHeader>
          <ModalCloseButton />

          <ModalBody pb={6}>
            <VStack spacing={6} align="flex-start">
              <FormControl>
                <FormLabel>CNAME</FormLabel>
                <Input variant="filled" value={currentStorage?.websiteHosting?.domain} readOnly />
              </FormControl>
              <FormControl>
                <FormLabel htmlFor="domain">{t("StoragePanel.domain")}</FormLabel>
                <Input
                  {...register("domain", {
                    required: true,
                  })}
                  variant="filled"
                  placeholder={String(t("StoragePanel.domainTip"))}
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button
              type="submit"
              onClick={handleSubmit(async (value) => {
                await updateWebsiteMutation.mutateAsync({
                  id: currentStorage?.websiteHosting.id,
                  domain: value.domain,
                });
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
