import React from "react";
import { useForm } from "react-hook-form";
import { Trans } from "react-i18next";
import {
  Button,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightAddon,
} from "@chakra-ui/react";
import { t } from "i18next";

import { CopyIcon } from "@/components/CommonIcon";
import CopyText from "@/components/CopyText";

import { useBindDomainMutation, useRemoveApplicationMutation } from "./service";

import useGlobalStore from "@/pages/globalStore";

export default function CustomDomain() {
  const { currentApp, showSuccess, setCurrentApp, showWarning } = useGlobalStore();

  const { register, handleSubmit } = useForm<{ domain: string }>({
    defaultValues: { domain: currentApp?.domain?.customDomain || "" },
  });

  const bindDomainMutation = useBindDomainMutation();
  const removeDomainMutation = useRemoveApplicationMutation();

  return (
    <>
      <div className="w-full pt-12 text-center text-xl font-medium">
        {t("StoragePanel.CustomApplicationDomain")}
      </div>
      <div className="m-auto w-[360px] pt-6">
        <FormControl>
          <FormLabel>CNAME</FormLabel>
          <InputGroup>
            <Input variant="filled" value={currentApp?.domain?.domain} readOnly />
            <InputRightAddon
              children={
                <CopyText text={currentApp?.domain?.domain}>
                  <span>
                    <CopyIcon color={"#BDC1C5"} size={14} />
                  </span>
                </CopyText>
              }
            />
          </InputGroup>
        </FormControl>
        <FormControl className="py-4">
          <FormLabel htmlFor="domain">{t("StoragePanel.domain")}</FormLabel>
          <Input
            {...register("domain", {
              required: true,
            })}
            variant="filled"
            placeholder={String(t("StoragePanel.domainTip"))}
          />
        </FormControl>
        <span>
          <Trans
            t={t}
            i18nKey="StoragePanel.cnameTip"
            values={{
              cnameDomain: currentApp?.domain?.domain,
            }}
          />
        </span>
        <div className="flex justify-between pt-8">
          <Button
            variant={"warn"}
            width={"180px"}
            onClick={async () => {
              const res: any = await removeDomainMutation.mutateAsync({});
              if (res.data) {
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
            width={"180px"}
            isLoading={bindDomainMutation.isLoading}
            onClick={handleSubmit(async (value) => {
              const res: any = await bindDomainMutation.mutateAsync({
                domain: value.domain,
              });
              if (res.data) {
                setCurrentApp({ ...currentApp, domain: res.data });
                showSuccess(t("StoragePanel.DomainUpdateSuccess"));
              } else if (res.error === "domain not resolved") {
                showWarning(t("StoragePanel.DomainNotResolved"));
              }
            })}
          >
            {t("Confirm")}
          </Button>
        </div>
      </div>
    </>
  );
}
