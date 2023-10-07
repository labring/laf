import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { ChevronLeftIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  FormControl,
  Input,
  InputGroup,
  InputRightElement,
  VStack,
} from "@chakra-ui/react";

import { SendEmailCodeButton } from "@/components/SendEmailCodeButton";
import SmsCodeInput from "@/components/SmsCodeInput";

import { useBindEmailMutation } from "../service";

import useGlobalStore from "@/pages/globalStore";

export default function EmailEditor(props: { handleBack: any }) {
  const { handleBack } = props;
  const { t } = useTranslation();
  const bindEmail = useBindEmailMutation();
  const { showSuccess, updateUserInfo } = useGlobalStore();
  const { register, getValues, control, handleSubmit } = useForm({
    defaultValues: {
      email: "",
      code: "",
    },
  });

  const onSubmit = async (data: any) => {
    const res = await bindEmail.mutateAsync(data);
    if (!res.error) {
      showSuccess(t("UserInfo.ChangeEmailSuccess"));
      updateUserInfo();
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
      <VStack className="flex w-full flex-col">
        <span className="w-full text-center text-xl">{t("UserInfo.ChangeEmail")}</span>
        <Box className="flex flex-col pt-14">
          <FormControl>
            <div className="pb-2">{t("UserInfo.Email")}</div>
            <InputGroup>
              <Input
                {...register("email", { required: true })}
                variant="userInfo"
                overflow="auto"
                width="64"
                pr="6rem"
              />
              <InputRightElement width="6rem" height={8}>
                <SendEmailCodeButton
                  getEmail={getValues}
                  emailAccount={"email"}
                  className="!h-6 !text-[12px]"
                  type="bind"
                />
              </InputRightElement>
            </InputGroup>
          </FormControl>
          <FormControl>
            <div className="pb-2 pt-4">{t("UserInfo.SmsNumber")}</div>
            <Controller
              name="code"
              control={control}
              render={({ field: { onChange, value } }) => (
                <div>
                  <SmsCodeInput value={value} onChange={onChange} />
                </div>
              )}
            />
          </FormControl>
          <Button width={64} mt={8} onClick={handleSubmit(onSubmit)}>
            {t("Save")}
          </Button>
        </Box>
      </VStack>
    </>
  );
}
