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

import { useSigninByPasswordMutation } from "@/pages/auth/service";

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
      navigate("/", { replace: true });
    }
  };

  return (
    <div>
      <FormControl isInvalid={!!errors?.account} className="flex mb-10 items-center">
        <FormLabel className="w-20" htmlFor="account">
          {t("AuthPanel.Account")}
        </FormLabel>
        <Input
          {...register("account", { required: true })}
          type="text"
          id="account"
          placeholder="请输入用户名"
        />
      </FormControl>
      <FormControl isInvalid={!!errors.password} className="flex mb-10 items-center">
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
            placeholder="请输入密码"
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
          className="w-full pt-5 pb-5"
          isLoading={false}
          onClick={handleSubmit(onSubmit)}
        >
          {t("AuthPanel.Login")}
        </Button>
        <div className="mt-2 flex justify-end">
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
  );
}
