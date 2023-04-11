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
} from "@chakra-ui/react";
import { t } from "i18next";

import { Routes } from "@/constants";

import { useSendSmsCodeMutation, useSigninBySmsCodeMutation } from "@/pages/auth/service";
import useGlobalStore from "@/pages/globalStore";

type FormData = {
  phone: string;
  validationCode: string;
};

export default function LoginByPhonePanel({
  switchLoginType,
  showPasswordSigninBtn,
}: {
  switchLoginType: () => void;
  showPasswordSigninBtn: boolean;
}) {
  const navigate = useNavigate();
  const sendSmsCodeMutation = useSendSmsCodeMutation();
  const signinBySmsCodeMutation = useSigninBySmsCodeMutation();
  const { showSuccess, showError } = useGlobalStore();
  const [isSendSmsCode, setIsSendSmsCode] = useState(false);
  const [countdown, setCountdown] = useState(60);

  const {
    register,
    getValues,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      phone: "",
      validationCode: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    const res = await signinBySmsCodeMutation.mutateAsync({
      phone: data.phone,
      code: data.validationCode,
    });

    if (res?.data) {
      navigate(Routes.dashboard, { replace: true });
    }
  };

  const handleSendSmsCode = async () => {
    if (isSendSmsCode) {
      return;
    }
    const phone = getValues("phone");
    const isValidate = /^1[2-9]\d{9}$/.test(phone);
    if (!isValidate) {
      showError(t("AuthPanel.PhoneTip"));
      return;
    }
    switchSmsCodeStatus();

    const res = await sendSmsCodeMutation.mutateAsync({
      phone,
      type: "Signin",
    });

    if (res?.data === "success") {
      showSuccess(t("AuthPanel.SmsCodeSendSuccess"));
    } else {
      showError(res.error);
    }
  };

  const switchSmsCodeStatus = () => {
    setIsSendSmsCode(true);
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((countdown) => {
        if (countdown === 0) {
          clearInterval(timer);
          setIsSendSmsCode(false);
          return 0;
        }
        return countdown - 1;
      });
    }, 1000);
  };

  return (
    <div>
      <FormControl isInvalid={!!errors?.phone} className="mb-10 flex items-center">
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
          />
          <InputRightElement width="6rem">
            <Button
              className="w-20"
              variant={isSendSmsCode ? "thirdly_disabled" : "thirdly"}
              onClick={handleSendSmsCode}
            >
              {isSendSmsCode ? `${countdown}s` : t("AuthPanel.getValidationCode")}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>

      <FormControl isInvalid={!!errors.validationCode} className="mb-10 flex items-center">
        <FormLabel className="w-20" htmlFor="phone">
          {t("AuthPanel.ValidationCode")}
        </FormLabel>
        <Input
          {...register("validationCode", {
            required: true,
            pattern: {
              value: /^\d{4,6}$/,
              message: t("AuthPanel.ValidationCodeTip"),
            },
          })}
          id="validationCode"
          placeholder={t("AuthPanel.ValidationCodeTip") || ""}
        />
      </FormControl>
      <div className="mt-10">
        <Button
          type="submit"
          className="w-full pb-5 pt-5"
          isLoading={signinBySmsCodeMutation.isLoading}
          onClick={handleSubmit(onSubmit)}
        >
          {t("AuthPanel.Login")}
        </Button>
        <div className="mt-2 flex justify-end">
          {showPasswordSigninBtn && (
            <Button size="xs" variant={"text"} onClick={switchLoginType}>
              {t("AuthPanel.PasswordLogin")}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
