import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { ChevronLeftIcon } from "@chakra-ui/icons";
import { Box, Button, FormControl, Input, useColorMode, VStack } from "@chakra-ui/react";

import { useBindUsernameMutation } from "../service";

import useGlobalStore from "@/pages/globalStore";

export default function UsernameEditor(props: { handleBack: any }) {
  const { handleBack } = props;
  const { t } = useTranslation();
  const bindUsername = useBindUsernameMutation();
  const { userInfo, updateUserInfo, showSuccess } = useGlobalStore((state) => state);
  const { colorMode } = useColorMode();
  const darkMode = colorMode === "dark";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data: any) => {
    const res = await bindUsername.mutateAsync(data);
    if (!res.error) {
      updateUserInfo();
      handleBack();
      showSuccess(t("UserInfo.EditUserNameSuccess"));
    }
  };

  return (
    <>
      <span
        onClick={() => handleBack()}
        className="absolute left-[290px] flex cursor-pointer items-center"
      >
        <ChevronLeftIcon boxSize={6} /> {t("Back")}
      </span>
      <VStack className="flex w-full flex-col">
        <span className="w-full text-center text-xl">{t("UserInfo.EditUserName")}</span>
        <Box className="flex w-[265px] flex-col pt-16">
          <FormControl isInvalid={!!errors?.username} className="flex flex-col justify-center">
            <div className="pb-2">{t("UserInfo.UserName")}</div>
            <Input
              {...register("username", {
                required: true,
              })}
              defaultValue={userInfo?.username}
              height={8}
              bg={!darkMode ? "#F8FAFB" : "none"}
              border={"1px"}
              borderColor={"#D5D6E1"}
            />
          </FormControl>
          <Button mt={8} onClick={handleSubmit(onSubmit)} type="submit">
            {t("Save")}
          </Button>
        </Box>
      </VStack>
    </>
  );
}
