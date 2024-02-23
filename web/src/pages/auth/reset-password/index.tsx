import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import {
  Button,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  useColorMode,
} from "@chakra-ui/react";
import clsx from "clsx";
import { t } from "i18next";

import { OutlineViewOffIcon, OutlineViewOnIcon } from "@/components/CommonIcon";
import { Logo, LogoText } from "@/components/LogoIcon";
import { SendEmailCodeButton } from "@/components/SendEmailCodeButton";
import { SendSmsCodeButton } from "@/components/SendSmsCodeButton";
import { COLOR_MODE, PROVIDER_NAME } from "@/constants";

import useAuthStore from "../store";

import { useResetPasswordMutation } from "@/pages/auth/service";
import useGlobalStore from "@/pages/globalStore";

type FormData = {
  phone?: string;
  email?: string;
  validationCode?: string;
  account: string;
  password: string;
  confirmPassword: string;
};

export default function ResetPassword() {
  const resetPasswordMutation = useResetPasswordMutation();
  const { showSuccess, showError } = useGlobalStore();
  const navigate = useNavigate();
  const { defaultProvider } = useAuthStore();

  const [isShowPassword, setIsShowPassword] = useState(false);

  const { colorMode } = useColorMode();
  const darkMode = colorMode === COLOR_MODE.dark;

  const {
    register,
    handleSubmit,
    getValues,
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

    const params =
      defaultProvider.name === PROVIDER_NAME.PHONE
        ? {
            phone: data.phone,
            code: data.validationCode,
            password: data.password,
            type: "ResetPassword",
          }
        : {
            email: data.email,
            code: data.validationCode,
            password: data.password,
            type: "ResetPassword",
          };

    const res = await resetPasswordMutation.mutateAsync(params);

    if (res?.data) {
      showSuccess(t("AuthPanel.ResetPasswordSuccess"));
      navigate("/login", { replace: true });
    }
  };

  return (
    <div
      className={clsx(
        "absolute right-[125px] top-1/2 h-[640px] w-[560px] -translate-y-1/2 rounded-3xl px-16 pt-[78px]",
        { "bg-white": !darkMode, "bg-lafDark-100": darkMode },
      )}
    >
      <div className="mb-9 flex items-center space-x-4">
        <Logo size="43px" outerColor="#33BABB" innerColor="white" />
        <LogoText size="51px" color={darkMode ? "#33BABB" : "#363C42"} />
      </div>
      <div>
        {defaultProvider.name === PROVIDER_NAME.PHONE && (
          <FormControl isInvalid={!!errors?.phone} className="mb-6 flex items-center">
            <FormLabel className="w-20" htmlFor="phone">
              {t("AuthPanel.Phone")}
            </FormLabel>
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
                placeholder={t("AuthPanel.PhonePlaceholder") || ""}
                bg={darkMode ? "#363C42" : "#F8FAFB"}
                border={darkMode ? "1px solid #24282C" : "1px solid #D5D6E1"}
                height="48px"
                rounded="4px"
              />
              <InputRightElement width="6rem" height="100%">
                <SendSmsCodeButton
                  getPhone={getValues}
                  phoneNumber={"phone"}
                  type="ResetPassword"
                />
              </InputRightElement>
            </InputGroup>
          </FormControl>
        )}
        {defaultProvider.name === PROVIDER_NAME.EMAIL && (
          <FormControl isInvalid={!!errors?.email} className="mb-6 flex items-center">
            <FormLabel className="w-20" htmlFor="email">
              {t("AuthPanel.Email")}
            </FormLabel>
            <InputGroup>
              <Input
                {...register("email", {
                  required: true,
                  pattern: {
                    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i,
                    message: t("AuthPanel.EmailTip"),
                  },
                })}
                type="email"
                id="email"
                placeholder={t("AuthPanel.EmailPlaceholder") || ""}
                bg={darkMode ? "#363C42" : "#F8FAFB"}
                border={darkMode ? "1px solid #24282C" : "1px solid #D5D6E1"}
                height="48px"
                rounded="4px"
              />
              <InputRightElement width="6rem" height="100%">
                <SendEmailCodeButton
                  getEmail={getValues}
                  emailAccount={"email"}
                  type="ResetPassword"
                />
              </InputRightElement>
            </InputGroup>
          </FormControl>
        )}
        <FormControl isInvalid={!!errors.validationCode} className="mb-6 flex items-center">
          <FormLabel className="w-20" htmlFor="validationCode">
            {t("AuthPanel.ValidationCode")}
          </FormLabel>
          <Input
            type="number"
            {...register("validationCode", {
              required: true,
              pattern: {
                value: /^\d{6}$/,
                message: t("AuthPanel.ValidationCodePlaceholder"),
              },
            })}
            id="validationCode"
            placeholder={t("AuthPanel.ValidationCodePlaceholder") || ""}
            bg={darkMode ? "#363C42" : "#F8FAFB"}
            border={darkMode ? "1px solid #24282C" : "1px solid #D5D6E1"}
            height="48px"
            rounded="4px"
          />
        </FormControl>
        <FormControl isInvalid={!!errors.password} className="mb-6 flex items-center">
          <FormLabel className="w-20" htmlFor="password">
            {t("AuthPanel.NewPassword")}
          </FormLabel>
          <InputGroup>
            <Input
              type={isShowPassword ? "text" : "password"}
              {...register("password", {
                required: true,
              })}
              id="password"
              placeholder={t("AuthPanel.PasswordPlaceholder") || ""}
              bg={darkMode ? "#363C42" : "#F8FAFB"}
              border={darkMode ? "1px solid #24282C" : "1px solid #D5D6E1"}
              height="48px"
              rounded="4px"
            />
            <InputRightElement width="2rem" height="100%">
              {isShowPassword ? (
                <OutlineViewOffIcon
                  className="cursor-pointer !text-primary-500"
                  onClick={() => setIsShowPassword(false)}
                />
              ) : (
                <OutlineViewOnIcon
                  className="cursor-pointer !text-primary-500"
                  onClick={() => setIsShowPassword(true)}
                />
              )}
            </InputRightElement>
          </InputGroup>
        </FormControl>
        <FormControl isInvalid={!!errors.confirmPassword} className="mb-6 flex items-center">
          <FormLabel className="w-20" htmlFor="confirmPassword">
            {t("AuthPanel.ConfirmPassword")}
          </FormLabel>
          <InputGroup>
            <Input
              type={isShowPassword ? "text" : "password"}
              {...register("confirmPassword", {
                required: true,
              })}
              id="confirmPassword"
              placeholder={t("AuthPanel.ConfirmPassword") || ""}
              bg={darkMode ? "#363C42" : "#F8FAFB"}
              border={darkMode ? "1px solid #24282C" : "1px solid #D5D6E1"}
              height="48px"
              rounded="4px"
            />
            <InputRightElement width="2rem" height="100%">
              {isShowPassword ? (
                <OutlineViewOffIcon
                  className="cursor-pointer !text-primary-500"
                  onClick={() => setIsShowPassword(false)}
                />
              ) : (
                <OutlineViewOnIcon
                  className="cursor-pointer !text-primary-500"
                  onClick={() => setIsShowPassword(true)}
                />
              )}
            </InputRightElement>
          </InputGroup>
        </FormControl>
        <div className="mb-5 mt-12">
          <Button
            type="submit"
            className="!h-[42px] w-full !bg-primary-500 hover:!bg-primary-600"
            isLoading={resetPasswordMutation.isLoading}
            onClick={handleSubmit(onSubmit)}
          >
            {t("AuthPanel.ResetPassword")}
          </Button>
        </div>
        <div className="flex justify-end">
          <Button
            className="!px-2 text-lg"
            variant={"text"}
            onClick={() => navigate("/login", { replace: true })}
          >
            {t("AuthPanel.ToLogin")}
          </Button>
        </div>
      </div>
    </div>
  );
}
