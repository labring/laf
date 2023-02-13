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
          <span className="font-semibold w-16">{t("StoragePanel.nowDomain")}</span>
          <InputGroup
            size="sm"
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
                  <span className="inline-block w-[6px] h-[6px] rounded-full mr-1 bg-primary-600"></span>
                  <span className="text-primary-600">
                    {currentStorage?.websiteHosting?.state === "Active"
                      ? t("StoragePanel.isResolved")
                      : t("StoragePanel.parsing")}
                  </span>
                </>
              }
            />
            <Input
              className="w-36 cursor-pointer"
              value={currentStorage?.websiteHosting?.domain}
              readOnly
            />
            <InputRightAddon
              onClick={(e) => {
                e.stopPropagation();
              }}
              children={
                <>
                  <CopyText
                    className="cursor-pointer"
                    text={currentStorage?.websiteHosting?.domain}
                  />
                  <IconWrap tooltip={String(t("Delete"))}>
                    <DeleteIcon
                      fontSize={13}
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
          style={{ borderRadius: "1rem" }}
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
              {currentStorage?.policy === "private" ? (
                <p className="text-error-500 font-semibold">{t("StoragePanel.editHostTip")}</p>
              ) : null}
              <FormControl>
                <FormLabel>CNAME</FormLabel>
                <InputGroup size="sm">
                  <Input variant="filled" value={currentStorage?.websiteHosting?.domain} readOnly />
                  <InputRightAddon
                    children={
                      <CopyText
                        text={currentStorage?.websiteHosting?.domain}
                        className="cursor-pointer"
                      />
                    }
                  />
                </InputGroup>
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
                <p className="mt-2 text-grayModern-600">
                  {t("StoragePanel.cnameHostPreTip") +
                    currentStorage?.websiteHosting?.domain +
                    t("StoragePanel.cnameHostSuffixTip")}
                  ,
                </p>
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
