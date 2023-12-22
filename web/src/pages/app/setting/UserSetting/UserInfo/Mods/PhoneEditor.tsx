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
  const { showSuccess, updateUserInfo, userInfo } = useGlobalStore();

  const {
    register,
    handleSubmit,
    control,
    getValues,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      oldPhoneNumber: userInfo?.phone || "",
      oldSmsCode: "",
      newPhoneNumber: "",
      newSmsCode: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    const res = await bindPhone.mutateAsync(
      userInfo?.phone ? data : { newPhoneNumber: data.newPhoneNumber, newSmsCode: data.newSmsCode },
    );
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
      <VStack>
        <span className="text-xl">{t("UserInfo.EditPhone")}</span>
        <Box className="w-[265px] pt-4">
          {userInfo?.phone && (
            <>
              <FormControl>
                <div className="pb-2">{t("UserInfo.OldPhoneNumber")}</div>
                <InputGroup>
                  <Input {...register("oldPhoneNumber")} variant="userInfo" isDisabled />
                  <InputRightElement width="6rem" height={8}>
                    <SendSmsCodeButton
                      getPhone={getValues}
                      phoneNumber={"oldPhoneNumber"}
                      className="!h-6 !text-[12px]"
                      type="Unbind"
                    />
                  </InputRightElement>
                </InputGroup>
              </FormControl>
              <FormControl isInvalid={!!errors.oldSmsCode}>
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
            </>
          )}
          <FormControl isInvalid={!!errors.newPhoneNumber}>
            <div className="pb-2 pt-4">
              {!userInfo?.phone ? t("UserInfo.PhoneNumber") : t("UserInfo.NewPhoneNumber")}
            </div>
            <InputGroup>
              <Input {...register("newPhoneNumber", { required: true })} variant="userInfo" />
              <InputRightElement width="6rem" height={8}>
                <SendSmsCodeButton
                  getPhone={getValues}
                  phoneNumber={"newPhoneNumber"}
                  className="!h-6 !text-[12px]"
                  type="Bind"
                />
              </InputRightElement>
            </InputGroup>
          </FormControl>
          <FormControl isInvalid={!!errors.newSmsCode}>
            <div className="pb-2 pt-4">
              {!userInfo?.phone ? t("UserInfo.SmsNumber") : t("UserInfo.NewSmsNumber")}
            </div>
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
          <Button mt="8" width="100%" onClick={handleSubmit(onSubmit)}>
            {t("Save")}
          </Button>
        </Box>
      </VStack>
    </>
  );
}
