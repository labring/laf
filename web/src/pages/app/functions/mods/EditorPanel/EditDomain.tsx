import React from "react";
import { useForm } from "react-hook-form";
import {
  Button,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightAddon,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Tooltip,
  useDisclosure,
} from "@chakra-ui/react";
import { t } from "i18next";

import CopyText from "@/components/CopyText";

import { useBindDomainMutation, useRemoveApplicationMutation } from "../../service";

import useGlobalStore from "@/pages/globalStore";

export default function EditDomain(props: { children: any }) {
  const { children } = props;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { currentApp, showSuccess, setCurrentApp } = useGlobalStore();

  const { register, handleSubmit, reset } = useForm<{ domain: string }>({
    defaultValues: { domain: currentApp?.domain?.customDomain || "" },
  });

  const bindDomainMutation = useBindDomainMutation();
  const removeDomainMutation = useRemoveApplicationMutation();

  return (
    <>
      <Tooltip label={t("Edit")}>
        {React.cloneElement(children, {
          onClick: (event?: any) => {
            event?.preventDefault();
            reset({ domain: currentApp?.domain?.customDomain || "" });
            onOpen();
          },
        })}
      </Tooltip>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t("StoragePanel.CustomDomain")}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>CNAME</FormLabel>
              <InputGroup>
                <Input variant="filled" value={currentApp?.domain?.domain} readOnly />
                <InputRightAddon
                  children={
                    <CopyText text={currentApp?.domain?.domain} className="cursor-pointer" />
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
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button
              variant={"warn"}
              onClick={async () => {
                const res: any = await removeDomainMutation.mutateAsync({});
                if (res.data) {
                  onClose();
                  setCurrentApp({ ...currentApp, domain: res.data });
                  showSuccess(t("StoragePanel.DomainDeleteSuccess"));
                }
              }}
              className="mr-4"
            >
              {t("Delete")}
            </Button>
            <Button
              type="submit"
              isLoading={bindDomainMutation.isLoading}
              onClick={handleSubmit(async (value) => {
                const res: any = await bindDomainMutation.mutateAsync({
                  domain: value.domain,
                });
                if (res.data) {
                  onClose();
                  setCurrentApp({ ...currentApp, domain: res.data });
                  showSuccess(t("StoragePanel.DomainUpdateSuccess"));
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
