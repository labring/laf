import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { ChevronLeftIcon } from "@chakra-ui/icons";
import { Box, Button, FormControl, Input, VStack } from "@chakra-ui/react";

import { useBindUsernameMutation } from "../service";

import useGlobalStore from "@/pages/globalStore";

export default function UsernameEditor(props: { handleBack: any }) {
  const { handleBack } = props;
  const { t } = useTranslation();
  const bindUsername = useBindUsernameMutation();
  const { userInfo, updateUserInfo, showSuccess } = useGlobalStore((state) => state);

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
        className="absolute left-[270px] flex cursor-pointer items-center"
      >
        <ChevronLeftIcon boxSize={6} /> {t("Back")}
      </span>
      <VStack>
        <span className="text-xl">{t("UserInfo.EditUserName")}</span>
        <Box className="w-[265px] pt-16">
          <FormControl isInvalid={!!errors?.username}>
            <div className="pb-2">{t("UserInfo.UserName")}</div>
            <Input
              {...register("username", {
                required: true,
              })}
              defaultValue={userInfo?.username}
              variant="userInfo"
            />
          </FormControl>
          <Button mt={8} width={"100%"} onClick={handleSubmit(onSubmit)} type="submit">
            {t("Save")}
          </Button>
        </Box>
      </VStack>
    </>
  );
}
