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

import useInviteCode from "@/hooks/useInviteCode";
import { useGroupMemberAddMutation } from "@/pages/app/collaboration/service";
import {
  useGithubAuthControllerBindMutation,
  useSendSmsCodeMutation,
  useSigninBySmsCodeMutation,
} from "@/pages/auth/service";
import useGlobalStore from "@/pages/globalStore";

type FormData = {
  phone: string;
  validationCode: string;
};

export default function LoginByPhonePanel({
  switchLoginType,
  showPasswordSigninBtn,
  isDarkMode,
}: {
  switchLoginType: () => void;
  showPasswordSigninBtn: boolean;
  isDarkMode: boolean;
}) {
  const navigate = useNavigate();
  const sendSmsCodeMutation = useSendSmsCodeMutation();
  const signinBySmsCodeMutation = useSigninBySmsCodeMutation();
  const { showSuccess, showError } = useGlobalStore();
  const [isSendSmsCode, setIsSendSmsCode] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const joinGroupMutation = useGroupMemberAddMutation();
  const githubAuthControllerBindMutation = useGithubAuthControllerBindMutation();

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

  const inviteCode = useInviteCode();

  const onSubmit = async (data: FormData) => {
    const res = await signinBySmsCodeMutation.mutateAsync({
      phone: data.phone,
      code: data.validationCode,
      inviteCode: inviteCode,
    });

    if (res?.data) {
      const githubToken = sessionStorage.getItem("githubToken");
      sessionStorage.removeItem("githubToken");
      if (githubToken) {
        githubAuthControllerBindMutation.mutateAsync({
          token: githubToken,
        });
      }
      const sessionData = sessionStorage.getItem("collaborationCode");
      const collaborationCode = JSON.parse(sessionData || "{}");
      sessionStorage.removeItem("collaborationCode");
      if (sessionData) {
        const res = await joinGroupMutation.mutateAsync({ code: collaborationCode.code });
        if (!res.error) {
          showSuccess(t("Collaborate.JoinSuccess"));
        }
        navigate(`/app/${collaborationCode.appid}/function`);
      } else {
        navigate(Routes.dashboard, { replace: true });
      }
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
      <FormControl isInvalid={!!errors?.phone} className="mb-6">
        <FormLabel className={isDarkMode ? "" : "text-grayModern-700"} htmlFor="phone">
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
            bg={isDarkMode ? "#363C42" : "#F8FAFB"}
            border={isDarkMode ? "1px solid #24282C" : "1px solid #D5D6E1"}
            height="48px"
            rounded="4px"
          />
          <InputRightElement width="6rem" height="100%">
            <Button
              className="w-20"
              variant={isSendSmsCode ? "text_disabled" : "text"}
              onClick={handleSendSmsCode}
            >
              {isSendSmsCode ? `${countdown}s` : t("AuthPanel.getValidationCode")}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>

      <FormControl isInvalid={!!errors.validationCode} className="mb-12">
        <FormLabel className={isDarkMode ? "" : "text-grayModern-700"} htmlFor="phone">
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
          bg={isDarkMode ? "#363C42" : "#F8FAFB"}
          border={isDarkMode ? "1px solid #24282C" : "1px solid #D5D6E1"}
          height="48px"
          rounded="4px"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSubmit(onSubmit)();
            }
          }}
        />
      </FormControl>
      <div>
        <Button
          type="submit"
          className="!h-[42px] w-full !bg-primary-500 hover:!bg-primary-600"
          isLoading={signinBySmsCodeMutation.isLoading}
          onClick={handleSubmit(onSubmit)}
        >
          {t("AuthPanel.LoginOrRegister")}
        </Button>
        <div className="mt-5 flex justify-end">
          {showPasswordSigninBtn && (
            <Button className="!px-2 text-lg" variant={"text"} onClick={switchLoginType}>
              {t("AuthPanel.PasswordLogin")}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
