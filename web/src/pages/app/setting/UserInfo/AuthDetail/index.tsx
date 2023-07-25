import { Controller, useForm } from "react-hook-form";
import { ChevronLeftIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  Input,
  InputGroup,
  InputRightElement,
  VStack,
} from "@chakra-ui/react";
import { t } from "i18next";

import { SendSmsCodeButton } from "@/components/SendSmsCodeButton";
import SmsCodeInput from "@/components/SmsCodeInput";

export default function AuthDetail(props: { handleBack: () => void }) {
  type FormData = {
    tel: string;
    code: string;
    name: string;
    id: string;
  };
  const {
    register,
    handleSubmit,
    getValues,
    control,
    formState: { errors },
  } = useForm<FormData>();

  const { handleBack } = props;
  const onSubmit = async (data: any) => {};

  return (
    <>
      <span
        onClick={() => handleBack()}
        className="absolute left-[280px] flex cursor-pointer items-center"
      >
        <ChevronLeftIcon boxSize={6} /> {t("Back")}
      </span>
      <VStack>
        <span className="text-center text-xl">{t("SettingPanel.Auth")}</span>
        <Box className="flex w-[265px] flex-col pt-4">
          <FormControl isRequired isInvalid={!!errors?.tel}>
            <div className="pb-2">{t("SettingPanel.Tel")}</div>
            <InputGroup>
              <Input
                {...register("tel", {
                  required: `${t("SettingPanel.Tel")}${t("IsRequired")}`,
                  pattern: {
                    value: /^1\d{10}$/,
                    message: t("SettingPanel.TelTip"),
                  },
                })}
                variant="userInfo"
              />
              <InputRightElement width="6rem" height={8}>
                <SendSmsCodeButton
                  getPhone={getValues}
                  phoneNumber={"tel"}
                  className="!h-6 !text-[12px]"
                  type="Unbind"
                />
              </InputRightElement>
            </InputGroup>
            {/* <FormErrorMessage className="absolute -bottom-4 left-[130px]  w-[250px]">
              {errors?.tel && errors?.tel?.message}
            </FormErrorMessage> */}
          </FormControl>
          <FormControl isRequired isInvalid={!!errors?.code}>
            <div className="pb-2 pt-4">{t("SettingPanel.Code")}:</div>
            <Controller
              name="code"
              control={control}
              render={({ field: { onChange, value } }) => (
                <div>
                  <SmsCodeInput value={value} onChange={onChange} />
                </div>
              )}
            />
            {/* <FormErrorMessage className="absolute -bottom-4 left-[130px]  w-[250px]">
              {errors?.code && errors?.code?.message}
            </FormErrorMessage> */}
          </FormControl>
          <FormControl isRequired isInvalid={!!errors?.name}>
            <div className="pb-2 pt-4">{t("SettingPanel.Name")}:</div>
            <Input
              {...register("name", {
                required: `${t("SettingPanel.Name")}${t("IsRequired")}`,
              })}
              variant="userInfo"
            />
            {/* <FormErrorMessage className="absolute -bottom-4 left-[130px]  w-[250px]">
              {errors?.name && errors?.name?.message}
            </FormErrorMessage> */}
          </FormControl>
          <FormControl isRequired isInvalid={!!errors?.id} className="pb-8">
            <div className="pb-2 pt-4">{t("SettingPanel.ID")}:</div>
            <Input
              {...register("id", {
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
              {errors?.id && errors?.id?.message}
            </FormErrorMessage>
          </FormControl>
        </Box>
        <Button width={"100%"} type="submit" onClick={handleSubmit(onSubmit)}>
          {t("SettingPanel.ToAuth")}
        </Button>
      </VStack>
    </>
  );
}
