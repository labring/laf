import { useForm } from "react-hook-form";
import { Box, Button, FormControl, FormErrorMessage, Input } from "@chakra-ui/react";
import { t } from "i18next";

import { hidePhoneNumber } from "@/utils/format";

import { useRealNameAuthMutation } from "../service";

import useGlobalStore from "@/pages/globalStore";

export default function AuthDetail() {
  const realNameAuthMutation = useRealNameAuthMutation();
  type FormData = {
    name: string;
    id_card: string;
  };
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();
  const { userInfo, showSuccess } = useGlobalStore((state) => state);

  const onSubmit = async (data: any) => {
    const res = await realNameAuthMutation.mutateAsync(data);
    if (!res.data) {
      showSuccess(res.data);
      window.location.href = "/dashboard";
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="mt-24 flex h-[64px] w-[590px] items-center justify-center rounded-t-2xl bg-primary-600 text-[20px] font-semibold text-white">
        {t("SettingPanel.Auth")}
      </div>
      <div className="flex h-[374px] w-[590px] justify-center rounded-b-2xl bg-white">
        <Box className="flex w-[265px] flex-col pt-10">
          <div className="pb-2">{t("SettingPanel.Tel")}</div>
          <Input
            variant="none"
            className="border-b-[1px] !px-0"
            value={hidePhoneNumber(userInfo?.phone || "")}
            isDisabled
          />
          <FormControl isRequired isInvalid={!!errors?.name}>
            <div className="pb-2 pt-4">{t("SettingPanel.Name")}</div>
            <Input
              {...register("name", {
                required: `${t("SettingPanel.Name")}${t("IsRequired")}`,
              })}
              variant="userInfo"
            />
          </FormControl>
          <FormControl isRequired isInvalid={!!errors?.id_card}>
            <div className="pb-2 pt-4">{t("SettingPanel.ID")}</div>
            <Input
              {...register("id_card", {
                required: `${t("SettingPanel.ID")}${t("IsRequired")}`,
                pattern: {
                  value:
                    /^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$|^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X)$/,
                  message: t("SettingPanel.IDTip"),
                },
              })}
              variant="userInfo"
            />
            <FormErrorMessage className="absolute -bottom-4 left-[130px] w-[250px]">
              {errors?.id_card && errors?.id_card?.message}
            </FormErrorMessage>
          </FormControl>
          <Button onClick={handleSubmit(onSubmit)} className="mt-10 !h-9">
            {t("SettingPanel.ToAuth")}
          </Button>
        </Box>
      </div>
    </div>
  );
}
