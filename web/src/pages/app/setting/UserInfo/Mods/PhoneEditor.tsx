import { useState } from "react";
import { useForm } from "react-hook-form";
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
  const [oldPhone, setOldPhone] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const bindPhone = useBindPhoneMutation();
  const { colorMode } = useColorMode();
  const darkMode = colorMode === "dark";

  const { showSuccess, updateUserInfo } = useGlobalStore();

  const {
    register,
    handleSubmit,
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
      <VStack className="flex w-full flex-col">
        <span className="w-full text-center text-xl">{t("UserInfo.EditPhone")}</span>
        <Box className="flex flex-col">
          <FormControl
            isInvalid={!!errors?.oldPhoneNumber}
            className="flex flex-col justify-center"
          >
            <div className="pb-2">{t("UserInfo.OldPhoneNumber")}</div>
            <InputGroup>
              <Input
                {...register("oldPhoneNumber", { required: true })}
                width={64}
                bg={!darkMode ? "#F8FAFB" : "none"}
                border={"1px"}
                borderColor={"#D5D6E1"}
                onChange={(e) => {
                  setOldPhone(e.target.value);
                }}
              />
              <InputRightElement width="6rem">
                <SendSmsCodeButton phone={oldPhone} />
              </InputRightElement>
            </InputGroup>
          </FormControl>
          <FormControl isInvalid={!!errors.oldSmsCode} className="flex flex-col justify-center">
            <div className="py-2">{t("UserInfo.OldSmsNumber")}</div>
            <Input
              {...register("oldSmsCode", { required: true })}
              width={64}
              bg={!darkMode ? "#F8FAFB" : "none"}
              border={"1px"}
              borderColor={"#D5D6E1"}
            />
          </FormControl>
          <FormControl isInvalid={!!errors.newPhoneNumber} className="flex flex-col justify-center">
            <div className="py-2">{t("UserInfo.NewPhoneNumber")}</div>
            <InputGroup>
              <Input
                {...register("newPhoneNumber", { required: true })}
                width={64}
                bg={!darkMode ? "#F8FAFB" : "none"}
                border={"1px"}
                borderColor={"#D5D6E1"}
                onChange={(e) => {
                  setNewPhone(e.target.value);
                }}
              />
              <InputRightElement width="6rem">
                <SendSmsCodeButton phone={newPhone} />
              </InputRightElement>
            </InputGroup>
          </FormControl>
          <FormControl isInvalid={!!errors.newSmsCode} className="flex flex-col justify-center">
            <div className="py-2">{t("UserInfo.NewSmsNumber")}</div>
            <Input
              {...register("newSmsCode", { required: true })}
              width={64}
              bg={!darkMode ? "#F8FAFB" : "none"}
              border={"1px"}
              borderColor={"#D5D6E1"}
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
