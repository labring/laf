import { useForm } from "react-hook-form";
import { MdKeyboardArrowLeft } from "react-icons/md";
import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  useColorMode,
  VStack,
} from "@chakra-ui/react";
import clsx from "clsx";
import { t } from "i18next";

export default function AuthDetail(props: { onBack: () => void }) {
  type FormData = {
    tel: string;
    code: string;
    name: string;
    id: string;
  };
  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const { colorMode } = useColorMode();
  const darkMode = colorMode === "dark";

  const onSubmit = async (data: any) => {};
  return (
    <>
      <p className="h-[40px] w-full flex-none text-left">
        <span
          className="cursor-pointer "
          onClick={() => {
            reset();
            props.onBack();
          }}
        >
          <MdKeyboardArrowLeft className="inline-block" fontSize={12} />
          {t("Back")}
        </span>
      </p>
      <div className="flex w-full flex-grow flex-col justify-around">
        <p
          className={clsx("mb-6 text-center text-xl", {
            "text-grayModern-900": !darkMode,
          })}
        >
          {t("SettingPanel.Auth")}
        </p>
        <VStack spacing={6} align="flex-start" className="mx-auto w-[48%]">
          <FormControl isRequired isInvalid={!!errors?.tel} className="relative">
            <div className="relative flex">
              <FormLabel className="min-w-[120px]" htmlFor="tel">
                {t("SettingPanel.Tel")}:
              </FormLabel>
              <Input
                size="sm"
                {...register("tel", {
                  required: `${t("SettingPanel.Tel")}${t("IsRequired")}`,
                  pattern: {
                    value: /^1\d{10}$/,
                    message: t("SettingPanel.TelTip"),
                  },
                })}
              />
              <Button style={{ position: "absolute", right: "-8rem" }} variant={"secondary"}>
                {t("SettingPanel.SendCode")}
              </Button>
            </div>
            <FormErrorMessage className="absolute -bottom-4 left-[130px]  w-[250px]">
              {errors?.tel && errors?.tel?.message}
            </FormErrorMessage>
          </FormControl>
          <FormControl isRequired isInvalid={!!errors?.code} className="relative">
            <div className="flex">
              <FormLabel className="min-w-[120px]" htmlFor="code">
                {t("SettingPanel.Code")}:
              </FormLabel>
              <Input
                size="sm"
                {...register("code", {
                  required: `${t("SettingPanel.Code")}${t("IsRequired")}`,
                  pattern: {
                    value: /^\d{4}$/,
                    message: t("SettingPanel.CodeTip"),
                  },
                })}
              />
            </div>
            <FormErrorMessage className="absolute -bottom-4 left-[130px]  w-[250px]">
              {errors?.code && errors?.code?.message}
            </FormErrorMessage>
          </FormControl>
          <FormControl isRequired isInvalid={!!errors?.name} className="relative">
            <div className="flex">
              <FormLabel className="min-w-[120px]" htmlFor="name">
                {t("SettingPanel.Name")}:
              </FormLabel>
              <Input
                size="sm"
                {...register("name", {
                  required: `${t("SettingPanel.Name")}${t("IsRequired")}`,
                })}
              />
            </div>
            <FormErrorMessage className="absolute -bottom-4 left-[130px]  w-[250px]">
              {errors?.name && errors?.name?.message}
            </FormErrorMessage>
          </FormControl>
          <FormControl isRequired isInvalid={!!errors?.id} className="relative">
            <div className="flex">
              <FormLabel className="min-w-[120px]" htmlFor="id">
                {t("SettingPanel.ID")}:
              </FormLabel>
              <Input
                size="sm"
                {...register("id", {
                  required: `${t("SettingPanel.ID")}${t("IsRequired")}`,
                  pattern: {
                    value:
                      /^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$|^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X)$/,
                    message: t("SettingPanel.IDTip"),
                  },
                })}
              />
            </div>
            <FormErrorMessage className="absolute -bottom-4 left-[130px] w-[250px]">
              {errors?.id && errors?.id?.message}
            </FormErrorMessage>
          </FormControl>
        </VStack>
        <div className="mt-6 w-full text-right">
          <Button colorScheme="primary" type="submit" onClick={handleSubmit(onSubmit)}>
            {t("SettingPanel.ToAuth")}
          </Button>
        </div>
      </div>
    </>
  );
}
