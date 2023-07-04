import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { ChevronLeftIcon } from "@chakra-ui/icons";
import { Box, Button, FormControl, Input, VStack } from "@chakra-ui/react";

export default function UserNameEditor(props: { setShowItem: any }) {
  const { setShowItem } = props;
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data: any) => {
    console.log(data);
  };

  return (
    <>
      <span
        onClick={() => setShowItem("")}
        className="absolute left-[290px] flex cursor-pointer items-center"
      >
        <ChevronLeftIcon boxSize={6} /> {t("Back")}
      </span>
      <VStack className="flex w-full flex-col">
        <span className="w-full text-center text-xl">{t("UserInfo.EditUserName")}</span>
        <Box className="flex flex-col pt-16">
          <FormControl isInvalid={!!errors?.username} className="flex flex-col justify-center">
            <div className="pb-2">{t("UserInfo.UserName")}</div>
            <Input
              {...register("username", {
                required: true,
              })}
              width={64}
              bg={"#F8FAFB"}
              border={"1px"}
              borderColor={"#D5D6E1"}
            />
          </FormControl>
          <Button width={64} mt={8} onClick={handleSubmit(onSubmit)} type="submit">
            {t("Save")}
          </Button>
        </Box>
      </VStack>
    </>
  );
}
