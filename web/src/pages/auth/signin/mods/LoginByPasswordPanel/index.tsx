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

import { OutlineViewOffIcon, OutlineViewOnIcon } from "@/components/CommonIcon";
import { PROVIDER_NAME, Routes } from "@/constants";

import { providersTypes } from "../..";

import { useGroupMemberAddMutation } from "@/pages/app/collaboration/service";
import {
  useGithubAuthControllerBindMutation,
  useSigninByPasswordMutation,
} from "@/pages/auth/service";
import useGlobalStore from "@/pages/globalStore";

type FormData = {
  account: string;
  password: string;
};

export default function LoginByPasswordPanel({
  setCurrentProvider,
  showSignupBtn,
  showPhoneSigninBtn,
  showEmailSigninBtn,
  isDarkMode,
}: {
  setCurrentProvider: (provider: providersTypes) => void;
  showSignupBtn: boolean;
  showPhoneSigninBtn: boolean;
  showEmailSigninBtn: boolean;
  isDarkMode: boolean;
}) {
  const signinByPasswordMutation = useSigninByPasswordMutation();
  const githubAuthControllerBindMutation = useGithubAuthControllerBindMutation();
  const navigate = useNavigate();
  const [isShowPassword, setIsShowPassword] = useState(false);
  const joinGroupMutation = useGroupMemberAddMutation();
  const { showSuccess } = useGlobalStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    const res = await signinByPasswordMutation.mutateAsync({
      username: data.account,
      password: data.password,
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

  return (
    <div>
      <FormControl isInvalid={!!errors?.account} className="mb-6">
        <FormLabel className={isDarkMode ? "" : "text-grayModern-700"} htmlFor="account">
          {t("AuthPanel.Account")}
        </FormLabel>
        <Input
          {...register("account", { required: true })}
          type="text"
          id="account"
          placeholder={t("AuthPanel.AccountPlaceholder") || ""}
          bg={isDarkMode ? "#363C42" : "#F8FAFB"}
          border={isDarkMode ? "1px solid #24282C" : "1px solid #D5D6E1"}
          height="48px"
          rounded="4px"
        />
      </FormControl>
      <FormControl isInvalid={!!errors.password} className="mb-12">
        <FormLabel className={isDarkMode ? "" : "text-grayModern-700"} htmlFor="phone">
          {t("AuthPanel.Password")}
        </FormLabel>
        <InputGroup>
          <Input
            type={isShowPassword ? "text" : "password"}
            {...register("password", {
              required: true,
            })}
            id="password"
            placeholder={t("AuthPanel.PasswordPlaceholder") || ""}
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
          <InputRightElement height="100%">
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
      <div>
        <Button
          type="submit"
          className="!h-[42px] w-full !bg-primary-500 hover:!bg-primary-600"
          isLoading={signinByPasswordMutation.isLoading}
          onClick={handleSubmit(onSubmit)}
        >
          {t("AuthPanel.Login")}
        </Button>
        <div className="mt-5 flex justify-between">
          {showPhoneSigninBtn || showEmailSigninBtn ? (
            <div>
              <Button
                className="!pl-2 !pr-0 text-lg"
                variant={"text"}
                onClick={() => navigate("/reset-password", { replace: true })}
              >
                {t("AuthPanel.ForgotPassword")}
              </Button>
            </div>
          ) : (
            <div></div>
          )}
          <div className="flex">
            {showPhoneSigninBtn && (
              <Button
                className="!px-2 text-lg"
                variant={"text"}
                onClick={() => {
                  setCurrentProvider(PROVIDER_NAME.PHONE);
                }}
              >
                {t("AuthPanel.PhoneLogin")}
              </Button>
            )}
            {showSignupBtn && showPhoneSigninBtn && (
              <div className="mx-3 flex items-center">
                <span className="h-3 w-[1px] bg-primary-500 text-primary-500"></span>
              </div>
            )}
            {showEmailSigninBtn && (
              <Button
                className="!px-2 text-lg"
                variant={"text"}
                onClick={() => {
                  setCurrentProvider(PROVIDER_NAME.EMAIL);
                }}
              >
                {t("AuthPanel.EmailLogin")}
              </Button>
            )}
            {showSignupBtn && showEmailSigninBtn && (
              <div className="mx-3 flex items-center">
                <span className="h-3 w-[1px] bg-primary-500 text-primary-500"></span>
              </div>
            )}
            {showSignupBtn && (
              <Button
                className="!px-2 text-lg"
                variant={"text"}
                onClick={() => navigate("/signup", { replace: true })}
              >
                {t("AuthPanel.ToRegister")}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
