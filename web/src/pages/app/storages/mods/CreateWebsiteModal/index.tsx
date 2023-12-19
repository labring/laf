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

import useGlobalStore from "@/pages/globalStore";

function CreateWebsiteModal() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { currentStorage, getOrigin } = useStorageStore();
  const { showSuccess, showInfo, showWarning } = useGlobalStore();
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
          <span className="mr-2 font-semibold text-grayModern-600">
            {t("StoragePanel.CurrentDomain")}
          </span>
          <Link
            className="mr-2 cursor-pointer"
            href={
              currentStorage?.websiteHosting?.isCustom
                ? `${window.location.protocol}//${currentStorage?.websiteHosting?.domain}`
                : getOrigin(currentStorage?.websiteHosting?.domain)
            }
            isExternal
          >
            {currentStorage?.websiteHosting?.domain}
          </Link>

          <SiteStatus />

          <Menu>
            <MenuButton className="-mt-[2px] ml-2">
              <MoreIcon fontSize={14} />
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
                    id: currentStorage?.websiteHosting?._id,
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
          px={4}
          height={8}
          variant={"secondary"}
          style={{ borderRadius: "1rem" }}
          disabled={currentStorage === undefined}
          onClick={async () => {
            if (!(currentStorage?.policy === BUCKET_POLICY_TYPE.readonly)) {
              toast({
                status: "warning",
                position: "top",
                title: t("StoragePanel.editHostTip"),
              });
              return;
            }
            const res = await createWebsiteMutation.mutateAsync({
              bucketName: currentStorage && currentStorage.name,
              state: BUCKET_STATUS.Active,
            });
            if (!res.error) {
              showSuccess(t("StoragePanel.SuccessfullyHosted"));
              showInfo(t("StoragePanel.SuccessfullyHostedTips"), 5000, true);
            }
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
              {!(currentStorage?.policy === BUCKET_POLICY_TYPE.readonly) ? (
                <p className="font-semibold text-error-500">{t("StoragePanel.editHostTip")}</p>
              ) : null}
              <FormControl>
                <FormLabel>CNAME</FormLabel>
                <InputGroup size="sm">
                  <Input variant="filled" value={cnameDomain} readOnly />
                  <InputRightAddon children={<CopyText text={cnameDomain} />} />
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
                const res = await updateWebsiteMutation.mutateAsync({
                  id: currentStorage?.websiteHosting._id,
                  domain: value.domain,
                });
                if (res.data) {
                  onClose();
                } else if (res.error === "domain not resolved") {
                  showWarning(t("StoragePanel.DomainNotResolved"));
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
