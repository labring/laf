import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Button, FormControl, Input, useColorMode } from "@chakra-ui/react";

import { CardIcon } from "@/components/CommonIcon";

import { useGiftCodeMutation } from "./service";

import useGlobalStore from "@/pages/globalStore";

export default function CardRedemption() {
  const { t } = useTranslation();
  const useGiftCode = useGiftCodeMutation();
  const { showSuccess } = useGlobalStore();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const darkMode = useColorMode().colorMode === "dark";

  const onSubmit = async (data: any) => {
    const res = await useGiftCode.mutateAsync({ code: data.giftCode });
    if (!res.error) {
      showSuccess(t("SettingPanel.ExchangeSuccess"));
    }
  };

  return (
    <div className="h-full w-full">
      <div className="flex items-center space-x-2 pt-2 text-2xl">
        <CardIcon size={20} color={darkMode ? "#F4F6F8" : "#24282C"} />
        <p>{t("SettingPanel.CardRedemption")}</p>
      </div>
      <div className="m-auto mt-24 w-[265px]">
        <span>{t("SettingPanel.CardRedemption")}</span>
        <FormControl isInvalid={!!errors?.giftCode}>
          <Input
            {...register("giftCode", {
              required: true,
            })}
            placeholder={String(t("SettingPanel.EnterGiftCode"))}
            className="mt-2 !border-frostyNightfall-300"
            bg={!darkMode ? "#F8FAFB" : "none"}
          />
        </FormControl>
        <Button className="mt-8 w-full" onClick={handleSubmit(onSubmit)}>
          {t("SettingModal.Exchange")}
        </Button>
      </div>
    </div>
  );
}
