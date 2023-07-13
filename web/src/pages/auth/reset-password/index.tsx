import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
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

import { SendSmsCodeButton } from "@/components/SendSmsCodeButton";
import { COLOR_MODE } from "@/constants";

import { useResetPasswordMutation } from "@/pages/auth/service";
import useGlobalStore from "@/pages/globalStore";

type FormData = {
  phone?: string;
  validationCode?: string;
  account: string;
  password: string;
  confirmPassword: string;
};

export default function ResetPassword() {
  const resetPasswordMutation = useResetPasswordMutation();
  const { showSuccess, showError } = useGlobalStore();
  const navigate = useNavigate();

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

    const params = {
      phone: data.phone,
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
        "absolute left-1/2 top-1/2 w-[560px] -translate-y-1/2 rounded-[10px] p-[65px]",
        { "bg-white": !darkMode, "bg-lafDark-100": darkMode },
      )}
    >
      <div className="mb-[45px]">
        <img src="/logo.png" alt="logo" width={40} className="mr-4" />
      </div>
      <div className="mb-[65px]">
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
              bg={"#F8FAFB"}
              border={"1px solid #D5D6E1"}
            />
            <InputRightElement width="6rem">
              <SendSmsCodeButton getPhone={getValues} phoneNumber={"phone"} />
            </InputRightElement>
          </InputGroup>
        </FormControl>
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
            bg={"#F8FAFB"}
            border={"1px solid #D5D6E1"}
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
              bg={"#F8FAFB"}
              border={"1px solid #D5D6E1"}
            />
            <InputRightElement width="2rem">
              {isShowPassword ? (
                <ViewOffIcon className="cursor-pointer" onClick={() => setIsShowPassword(false)} />
              ) : (
                <ViewIcon className="cursor-pointer" onClick={() => setIsShowPassword(true)} />
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
              bg={"#F8FAFB"}
              border={"1px solid #D5D6E1"}
            />
            <InputRightElement width="2rem">
              {isShowPassword ? (
                <ViewOffIcon className="cursor-pointer" onClick={() => setIsShowPassword(false)} />
              ) : (
                <ViewIcon className="cursor-pointer" onClick={() => setIsShowPassword(true)} />
              )}
            </InputRightElement>
          </InputGroup>
        </FormControl>
        <div className="mb-6">
          <Button
            type="submit"
            className={clsx("w-full", "pb-5 pt-5")}
            isLoading={resetPasswordMutation.isLoading}
            onClick={handleSubmit(onSubmit)}
          >
            {t("AuthPanel.ResetPassword")}
          </Button>
        </div>
        <div className="mt-2 flex justify-end">
          <Button size="xs" variant={"text"} onClick={() => navigate("/login", { replace: true })}>
            {t("AuthPanel.ToLogin")}
          </Button>
        </div>
      </div>
    </div>
  );
}
