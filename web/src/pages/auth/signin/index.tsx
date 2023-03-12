import { useForm } from "react-hook-form";
import { AiFillGithub } from "react-icons/ai";
import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  Radio,
} from "@chakra-ui/react";
import { t } from "i18next";

type FormData = {
  phone: string;
  validationCode: string;
  agreement?: boolean;
};

export default function SignIn() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = (data: FormData) => {
    console.log(data);
  };

  return (
    <div className="bg-white absolute left-1/2 top-1/2 -translate-y-1/2 w-[560px] h-[644px] rounded-[10px] p-[65px]">
      <div className="mb-[45px]">
        <img src="/logo.png" alt="logo" width={40} className="mr-4" />
      </div>
      <div className="mb-[65px]">
        <FormControl isInvalid={!!errors?.phone} className="flex mb-10 items-center">
          <FormLabel className="w-20" htmlFor="phone">
            {t("LoginPanel.Phone")}
          </FormLabel>
          <InputGroup>
            <Input
              {...register("phone", {
                pattern: {
                  value: /^1[2-9]\d{9}$/,
                  message: t("LoginPanel.PhoneTip"),
                },
              })}
              type="tel"
              id="phone"
              placeholder="请输入手机号"
            />
            <InputRightElement width="6rem">
              <Button className="h-1 w-20 rounded-md" variant="thirdly" disabled>
                {t("LoginPanel.getValidationCode")}
              </Button>
            </InputRightElement>
          </InputGroup>
          <FormErrorMessage>{errors.phone && errors.phone?.message}</FormErrorMessage>
        </FormControl>
        <FormControl isInvalid={!!errors.validationCode} className="flex mb-10 items-center">
          <FormLabel className="w-20" htmlFor="phone">
            {t("LoginPanel.ValidationCode")}
          </FormLabel>
          <Input
            {...register("validationCode", {
              pattern: {
                value: /^\d{6}$/,
                message: t("LoginPanel.ValidationCodeTip"),
              },
            })}
            id="validationCode"
            placeholder="请输入验证码"
          />
          <FormErrorMessage>
            {errors.validationCode && errors.validationCode.message}
          </FormErrorMessage>
        </FormControl>
        <div className="flex items-center mb-10">
          <Radio {...register("agreement")} value="1" className="mr-4" colorScheme={"primary"} />
          <span className="text-[14px] text-[#333333]">
            我已阅读并同意{" "}
            <a href="" className="text-[#33BAB1]">
              服务协议
            </a>{" "}
            和{" "}
            <a href="" className="text-[#33BAB1]">
              隐私协议
            </a>
          </span>
        </div>
        <div className="mb-10">
          <Button
            type="submit"
            className="w-full pt-5 pb-5"
            isLoading={false}
            onClick={handleSubmit(onSubmit)}
          >
            {t("LoginPanel.Login")}
          </Button>
        </div>
        <div className="mt-20">
          <div className="w-full text-center mb-5 relative before:content-[''] before:block before:w-full before:h-[1px] before:bg-slate-300 before:absolute before:top-1/2">
            <span className="pl-5 pr-5 bg-white z-10 relative">or</span>
          </div>
          <Button type="submit" className="w-full pt-5 pb-5" colorScheme="white" variant="plain">
            <AiFillGithub className="mr-4" />
            {t("LoginPanel.LoginWithGithub")}
          </Button>
        </div>
      </div>
    </div>
  );
}
