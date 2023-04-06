import { useForm } from "react-hook-form";
import { Trans, useTranslation } from "react-i18next";
import {
  Button,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightAddon,
  Link,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  useToast,
  VStack,
} from "@chakra-ui/react";

import { MoreIcon } from "@/components/CommonIcon";
import CopyText from "@/components/CopyText";
import { BUCKET_POLICY_TYPE, BUCKET_STATUS } from "@/constants";

import {
  useWebsiteCreateMutation,
  useWebsiteDeleteMutation,
  useWebSiteUpdateMutation,
} from "../../service";
import useStorageStore from "../../store";

import SiteStatus from "./SiteStatus";

function CreateWebsiteModal() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { currentStorage, getOrigin } = useStorageStore();
  const { register, setFocus, handleSubmit, reset } = useForm<{ domain: string }>();
  const { t } = useTranslation();
  const createWebsiteMutation = useWebsiteCreateMutation();
  const deleteWebsiteMutation = useWebsiteDeleteMutation();
  const updateWebsiteMutation = useWebSiteUpdateMutation();
  const toast = useToast();
  const cnameDomain = currentStorage?.domain?.domain;

  return (
    <>
      {currentStorage?.websiteHosting &&
      currentStorage.websiteHosting.state === BUCKET_STATUS.Active ? (
        <div className="flex">
          <span className="mr-2 font-semibold">{t("StoragePanel.CurrentDomain")}</span>
          <Link
            className="mr-2 cursor-pointer"
            href={
              currentStorage?.websiteHosting?.isCustom
                ? // custom domain don't support https currently
                  "http://" + currentStorage?.websiteHosting?.domain
                : getOrigin(currentStorage?.websiteHosting?.domain)
            }
            isExternal
          >
            {currentStorage?.websiteHosting?.domain}
          </Link>

          <SiteStatus />

          <Menu>
            <MenuButton className="-mt-[2px] ml-2">
              <MoreIcon fontSize={10} />
            </MenuButton>
            <MenuList minWidth="100px">
              <MenuItem
                onClick={() => {
                  if (currentStorage?.websiteHosting?.state === BUCKET_STATUS.Active) {
                    onOpen();
                    reset({});
                    setTimeout(() => {
                      setFocus("domain");
                      reset({
                        domain: currentStorage?.websiteHosting?.isCustom
                          ? currentStorage?.websiteHosting?.domain
                          : "",
                      });
                    }, 0);
                  }
                }}
              >
                {t("StoragePanel.CustomDomain")}
              </MenuItem>
              <MenuItem
                onClick={() => {
                  deleteWebsiteMutation.mutateAsync({
                    id: currentStorage?.websiteHosting?.id,
                  });
                }}
              >
                {t("StoragePanel.CancelHost")}
              </MenuItem>
            </MenuList>
          </Menu>
        </div>
      ) : (
        <Button
          size="xs"
          variant={"secondary"}
          style={{ borderRadius: "1rem" }}
          disabled={currentStorage === undefined}
          onClick={() => {
            if (currentStorage?.policy === BUCKET_POLICY_TYPE.private) {
              toast({
                status: "warning",
                position: "top",
                title: t("StoragePanel.editHostTip"),
              });
              return;
            }
            createWebsiteMutation.mutateAsync({
              bucketName: currentStorage && currentStorage.name,
              state: BUCKET_STATUS.Active,
            });
          }}
        >
          {t("StoragePanel.websiteHost")}
        </Button>
      )}

      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t("StoragePanel.CustomDomain")}</ModalHeader>
          <ModalCloseButton />

          <ModalBody pb={6}>
            <VStack spacing={6} align="flex-start">
              {currentStorage?.policy === BUCKET_POLICY_TYPE.private ? (
                <p className="font-semibold text-error-500">{t("StoragePanel.editHostTip")}</p>
              ) : null}
              <FormControl>
                <FormLabel>CNAME</FormLabel>
                <InputGroup size="sm">
                  <Input variant="filled" value={cnameDomain} readOnly />
                  <InputRightAddon
                    children={<CopyText text={cnameDomain} className="cursor-pointer" />}
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
                  <Trans
                    t={t}
                    i18nKey="StoragePanel.cnameTip"
                    values={{
                      cnameDomain: cnameDomain,
                    }}
                  />
                </p>
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button
              type="submit"
              isLoading={updateWebsiteMutation.isLoading}
              onClick={handleSubmit(async (value) => {
                const res: any = await updateWebsiteMutation.mutateAsync({
                  id: currentStorage?.websiteHosting.id,
                  domain: value.domain,
                });
                if (res.data) {
                  onClose();
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

export default CreateWebsiteModal;
