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
  useColorMode,
  VStack,
} from "@chakra-ui/react";

import { SendSmsCodeButton } from "@/components/SendSmsCodeButton";
import SmsCodeInput from "@/components/SmsCodeInput";

import { useBindPhoneMutation } from "../service";

import useGlobalStore from "@/pages/globalStore";

type FormData = {
  oldPhoneNumber: string;
  oldSmsCode: string;
  newPhoneNumber: string;
  newSmsCode: string;
};

export default function PhoneEditor(props: { handleBack: any }) {
  const { handleBack } = props;
  const { t } = useTranslation();
  const bindPhone = useBindPhoneMutation();
  const { colorMode } = useColorMode();
  const darkMode = colorMode === "dark";

  const { showSuccess, updateUserInfo } = useGlobalStore();

  const {
    register,
    handleSubmit,
    control,
    getValues,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      oldPhoneNumber: "",
      oldSmsCode: "",
      newPhoneNumber: "",
      newSmsCode: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    const res = await bindPhone.mutateAsync(data);
    if (!res.error) {
      updateUserInfo();
      showSuccess(t("UserInfo.EditPhoneSuccess"));
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
      <VStack className="flex">
        <span className="text-center text-xl">{t("UserInfo.EditPhone")}</span>
        <Box className="flex w-[265px] flex-col pt-4">
          <FormControl
            isInvalid={!!errors?.oldPhoneNumber}
            className="flex flex-col justify-center"
          >
            <div className="pb-2">{t("UserInfo.OldPhoneNumber")}</div>
            <InputGroup>
              <Input
                {...register("oldPhoneNumber", { required: true })}
                bg={!darkMode ? "#F8FAFB" : "none"}
                border={"1px"}
                height={"32px"}
                borderColor={"#D5D6E1"}
              />
              <InputRightElement width="6rem" height={8}>
                <SendSmsCodeButton
                  getPhone={getValues}
                  phoneNumber={"oldPhoneNumber"}
                  className="!h-6 !text-[12px]"
                />
              </InputRightElement>
            </InputGroup>
          </FormControl>
          <FormControl isInvalid={!!errors.oldSmsCode} className="flex flex-col justify-center">
            <div className="pb-2 pt-4">{t("UserInfo.OldSmsNumber")}</div>
            <Controller
              name="oldSmsCode"
              control={control}
              render={({ field: { onChange, value } }) => (
                <div>
                  <SmsCodeInput value={value} onChange={onChange} />
                </div>
              )}
            />
          </FormControl>
          <FormControl isInvalid={!!errors.newPhoneNumber} className="flex flex-col justify-center">
            <div className="pb-2 pt-4">{t("UserInfo.NewPhoneNumber")}</div>
            <InputGroup>
              <Input
                {...register("newPhoneNumber", { required: true })}
                bg={!darkMode ? "#F8FAFB" : "none"}
                border={"1px"}
                height={"32px"}
                borderColor={"#D5D6E1"}
              />
              <InputRightElement width="6rem" height={8}>
                <SendSmsCodeButton
                  getPhone={getValues}
                  phoneNumber={"newPhoneNumber"}
                  className="!h-6 !text-[12px]"
                />
              </InputRightElement>
            </InputGroup>
          </FormControl>
          <FormControl isInvalid={!!errors.newSmsCode} className="flex flex-col justify-center">
            <div className="pb-2 pt-4">{t("UserInfo.NewSmsNumber")}</div>
            <Controller
              name="newSmsCode"
              control={control}
              render={({ field: { onChange, value } }) => (
                <div>
                  <SmsCodeInput value={value} onChange={onChange} />
                </div>
              )}
            />
          </FormControl>
          <Button mt={8} onClick={handleSubmit(onSubmit)}>
            {t("Save")}
          </Button>
        </Box>
      </VStack>
    </>
  );
}
