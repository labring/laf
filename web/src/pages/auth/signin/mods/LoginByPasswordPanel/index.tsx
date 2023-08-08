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
} from "@chakra-ui/react";
import { t } from "i18next";

import { Routes } from "@/constants";

import { useGroupMemberAddMutation } from "@/pages/app/collaboration/service";
import { useSigninByPasswordMutation } from "@/pages/auth/service";
import useGlobalStore from "@/pages/globalStore";

type FormData = {
  account: string;
  password: string;
};

export default function LoginByPasswordPanel({
  switchLoginType,
  showSignupBtn,
  showPhoneSigninBtn,
}: {
  switchLoginType: () => void;
  showSignupBtn: boolean;
  showPhoneSigninBtn: boolean;
}) {
  const signinByPasswordMutation = useSigninByPasswordMutation();
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
      <FormControl isInvalid={!!errors?.account} className="mb-10 flex items-center">
        <FormLabel className="w-20" htmlFor="account">
          {t("AuthPanel.Account")}
        </FormLabel>
        <Input
          {...register("account", { required: true })}
          type="text"
          id="account"
          placeholder={t("AuthPanel.AccountPlaceholder") || ""}
          bg={"#F8FAFB"}
          border={"1px solid #D5D6E1"}
        />
      </FormControl>
      <FormControl isInvalid={!!errors.password} className="mb-10 flex items-center">
        <FormLabel className="w-20" htmlFor="phone">
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
      <div className="mt-10">
        <Button
          type="submit"
          className="w-full pb-5 pt-5"
          isLoading={signinByPasswordMutation.isLoading}
          onClick={handleSubmit(onSubmit)}
        >
          {t("AuthPanel.Login")}
        </Button>
        <div className="mt-2 flex justify-between">
          <div>
            <Button
              className="mr-1"
              size="xs"
              variant={"text"}
              onClick={() => navigate("/reset-password", { replace: true })}
            >
              {t("AuthPanel.ForgotPassword")}
            </Button>
          </div>
          <div>
            {showPhoneSigninBtn && (
              <Button className="mr-1" size="xs" variant={"text"} onClick={switchLoginType}>
                {t("AuthPanel.PhoneLogin")}
              </Button>
            )}
            {showSignupBtn && (
              <Button
                size="xs"
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
