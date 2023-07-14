import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { ChevronLeftIcon } from "@chakra-ui/icons";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import {
  Button,
  FormControl,
  Input,
  InputGroup,
  InputRightElement,
  useColorMode,
} from "@chakra-ui/react";

import { SendSmsCodeButton } from "@/components/SendSmsCodeButton";
import SmsCodeInput from "@/components/SmsCodeInput";

import { useResetPasswordMutation } from "@/pages/auth/service";
import useGlobalStore from "@/pages/globalStore";

type FormData = {
  phone?: string;
  validationCode?: string;
  password: string;
  confirmPassword: string;
};

export default function UserNameEditor(props: { handleBack: any }) {
  const { handleBack } = props;
  const { t } = useTranslation();
  const darkMode = useColorMode().colorMode === "dark";
  const [isShowPassword, setIsShowPassword] = useState(false);
  const { showSuccess, showError } = useGlobalStore();
  const resetPasswordMutation = useResetPasswordMutation();

  const {
    register,
    handleSubmit,
    getValues,
    control,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      phone: "",
      validationCode: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    if (data.password !== data.confirmPassword) {
      showError(t("AuthPanel.PasswordNotMatch"));
      return;
    }

    const params = {
      phone: data.phone,
      code: data.validationCode,
      password: data.password,
      type: "ResetPassword",
    };

    const res = await resetPasswordMutation.mutateAsync(params);

    if (res?.data) {
      showSuccess(t("AuthPanel.ResetPasswordSuccess"));
      handleBack();
    }
  };

  return (
    <>
      <span
        onClick={() => handleBack()}
        className="absolute left-[280px] flex cursor-pointer items-center"
      >
        <ChevronLeftIcon boxSize={6} /> {t("Back")}
      </span>
      <div className="flex flex-col">
        <span className="w-full text-center text-xl">{t("UserInfo.EditPassword")}</span>
        <div className="w-[265px] pt-5">
          <FormControl isInvalid={!!errors?.phone} className="mb-4 flex flex-col">
            <div className="pb-2">{t("AuthPanel.Phone")}</div>
            <InputGroup>
              <Input
                {...register("phone", {
                  required: true,
                  pattern: {
                    value: /^1[2-9]\d{9}$/,
                    message: t("AuthPanel.PhoneTip"),
                  },
                })}
                type="tel"
                id="phone"
                bg={!darkMode ? "#F8FAFB" : "none"}
                border={"1px"}
                height={"32px"}
                borderColor={"#D5D6E1"}
              />
              <InputRightElement width="6rem" height={8}>
                <SendSmsCodeButton
                  getPhone={getValues}
                  phoneNumber={"phone"}
                  className="!h-6 !text-[12px]"
                />
              </InputRightElement>
            </InputGroup>
          </FormControl>
          <FormControl isInvalid={!!errors.validationCode} className="mb-4 flex flex-col">
            <div className="pb-2">{t("AuthPanel.ValidationCode")}</div>
            <Controller
              name="validationCode"
              control={control}
              render={({ field: { onChange, value } }) => (
                <div>
                  <SmsCodeInput value={value} onChange={onChange} />
                </div>
              )}
            />
          </FormControl>
          <FormControl isInvalid={!!errors.password} className="mb-4 flex flex-col">
            <div className="pb-2">{t("AuthPanel.NewPassword")}</div>
            <InputGroup>
              <Input
                type={isShowPassword ? "text" : "password"}
                {...register("password", {
                  required: true,
                })}
                id="password"
                bg={!darkMode ? "#F8FAFB" : "none"}
                border={"1px"}
                height={"32px"}
                borderColor={"#D5D6E1"}
              />
              <InputRightElement width="2rem" height={8}>
                {isShowPassword ? (
                  <ViewOffIcon
                    className="cursor-pointer"
                    onClick={() => setIsShowPassword(false)}
                  />
                ) : (
                  <ViewIcon className="cursor-pointer" onClick={() => setIsShowPassword(true)} />
                )}
              </InputRightElement>
            </InputGroup>
          </FormControl>
          <FormControl isInvalid={!!errors.confirmPassword} className="mb-8 flex flex-col">
            <div className="pb-2">{t("AuthPanel.ConfirmPassword")}</div>
            <InputGroup>
              <Input
                type={isShowPassword ? "text" : "password"}
                {...register("confirmPassword", {
                  required: true,
                })}
                id="confirmPassword"
                bg={!darkMode ? "#F8FAFB" : "none"}
                border={"1px"}
                height={"32px"}
                borderColor={"#D5D6E1"}
              />
              <InputRightElement width="2rem" height={8}>
                {isShowPassword ? (
                  <ViewOffIcon
                    className="cursor-pointer"
                    onClick={() => setIsShowPassword(false)}
                  />
                ) : (
                  <ViewIcon className="cursor-pointer" onClick={() => setIsShowPassword(true)} />
                )}
              </InputRightElement>
            </InputGroup>
          </FormControl>
          <Button
            type="submit"
            className="w-full"
            isLoading={resetPasswordMutation.isLoading}
            onClick={handleSubmit(onSubmit)}
          >
            {t("AuthPanel.ResetPassword")}
          </Button>
        </div>
      </div>
    </>
  );
}
