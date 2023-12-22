import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { ChevronLeftIcon } from "@chakra-ui/icons";
import {
  Button,
  FormControl,
  Input,
  InputGroup,
  InputRightElement,
  VStack,
} from "@chakra-ui/react";

import { OutlineViewOffIcon, OutlineViewOnIcon } from "@/components/CommonIcon";
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
  const [isShowPassword, setIsShowPassword] = useState(false);
  const { showSuccess, showError, userInfo } = useGlobalStore();
  const resetPasswordMutation = useResetPasswordMutation();

  const {
    register,
    handleSubmit,
    getValues,
    control,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      phone: userInfo?.phone || "",
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
        className="absolute left-[270px] flex cursor-pointer items-center"
      >
        <ChevronLeftIcon boxSize={6} /> {t("Back")}
      </span>
      <VStack spacing="0">
        <span className="text-xl">{t("UserInfo.EditPassword")}</span>
        <div className="w-[265px] pt-5">
          <FormControl isInvalid={!!errors?.phone}>
            <div className="pb-2">{t("AuthPanel.Phone")}</div>
            <InputGroup>
              <Input {...register("phone")} variant="userInfo" isDisabled />
              <InputRightElement width="6rem" height={8}>
                <SendSmsCodeButton
                  getPhone={getValues}
                  phoneNumber={"phone"}
                  className="!h-6 !text-[12px]"
                  type="ResetPassword"
                />
              </InputRightElement>
            </InputGroup>
          </FormControl>
          <FormControl isInvalid={!!errors.validationCode}>
            <div className="pb-2 pt-4">{t("AuthPanel.ValidationCode")}</div>
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
          <FormControl isInvalid={!!errors.password}>
            <div className="pb-2 pt-4">{t("AuthPanel.NewPassword")}</div>
            <InputGroup>
              <Input
                type={isShowPassword ? "text" : "password"}
                {...register("password", {
                  required: true,
                })}
                id="password"
                variant="userInfo"
              />
              <InputRightElement width="2rem" height={8}>
                {isShowPassword ? (
                  <OutlineViewOffIcon
                    className="cursor-pointer !text-primary-600"
                    onClick={() => setIsShowPassword(false)}
                  />
                ) : (
                  <OutlineViewOnIcon
                    className="cursor-pointer !text-primary-600"
                    onClick={() => setIsShowPassword(true)}
                  />
                )}
              </InputRightElement>
            </InputGroup>
          </FormControl>
          <FormControl isInvalid={!!errors.confirmPassword}>
            <div className="pb-2 pt-4">{t("AuthPanel.ConfirmPassword")}</div>
            <InputGroup>
              <Input
                type={isShowPassword ? "text" : "password"}
                {...register("confirmPassword", {
                  required: true,
                })}
                id="confirmPassword"
                variant="userInfo"
              />
              <InputRightElement width="2rem" height={8}>
                {isShowPassword ? (
                  <OutlineViewOffIcon
                    className="cursor-pointer !text-primary-600"
                    onClick={() => setIsShowPassword(false)}
                  />
                ) : (
                  <OutlineViewOnIcon
                    className="cursor-pointer !text-primary-600"
                    onClick={() => setIsShowPassword(true)}
                  />
                )}
              </InputRightElement>
            </InputGroup>
          </FormControl>
          <Button
            type="submit"
            className="w-full"
            mt="8"
            isLoading={resetPasswordMutation.isLoading}
            onClick={handleSubmit(onSubmit)}
          >
            {t("AuthPanel.ResetPassword")}
          </Button>
        </div>
      </VStack>
    </>
  );
}
