import { useState } from "react";
import { useForm } from "react-hook-form";
import { HiOutlineDeviceMobile } from "react-icons/hi";
import { MdKeyboardArrowLeft } from "react-icons/md";
import { TbCalendarTime } from "react-icons/tb";
import {
  Avatar,
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  Input,
  VStack,
} from "@chakra-ui/react";
import { t } from "i18next";

import { formatDate } from "@/utils/format";

import useGlobalStore from "@/pages/globalStore";
export default function UserInfo() {
  const [showAuth, setShowAuth] = useState(false);
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
  const { userInfo } = useGlobalStore((state) => state);

  const onSubmit = async (data: any) => {};

  return (
    <div className="h-full flex flex-col items-center justify-center">
      {showAuth ? (
        <>
          <p className="h-[40px] flex-none text-left w-full">
            <span
              className="cursor-pointer "
              onClick={() => {
                setShowAuth(false);
              }}
            >
              <MdKeyboardArrowLeft className="inline-block" fontSize={12} />
              {t("Back")}
            </span>
          </p>
          <div className="flex-grow w-full">
            <p className="text-grayModern-900 text-xl text-center mb-6">{t("SettingPanel.Auth")}</p>
            <VStack spacing={6} align="flex-start" className="w-[48%] mx-auto">
              <FormControl isRequired isInvalid={!!errors?.tel} className="relative">
                <div className="flex relative">
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
                <FormErrorMessage className="absolute -bottom-4 left-[130px]">
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
                <FormErrorMessage className="absolute -bottom-4 left-[130px]">
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
                <FormErrorMessage className="absolute -bottom-4 left-[130px]">
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
                <FormErrorMessage className="absolute -bottom-4 left-[130px]">
                  {errors?.id && errors?.id?.message}
                </FormErrorMessage>
              </FormControl>
            </VStack>
            <div className="text-right mt-4 w-full">
              <Button colorScheme="primary" type="submit" onClick={handleSubmit(onSubmit)}>
                {t("SettingPanel.ToAuth")}
              </Button>
            </div>
          </div>
        </>
      ) : (
        <>
          <Box className="text-center relative">
            <Avatar
              size="lg"
              name={userInfo?.username}
              bgColor="primary.500"
              color="white"
              boxShadow="base"
            />
            <p className="text-center text-3xl font-medium text-grayModern-900 mb-2">
              {userInfo?.username}
            </p>
            <span className="inline-block px-2 h-[24px]  rounded-full border border-grayModern-400 text-grayModern-400 pt-[1px]">
              {t("SettingPanel.noAuth")}
            </span>
            <span
              className="absolute min-w-[70px] mt-1 text-blue-700 cursor-pointer inline-block"
              onClick={() => {
                setShowAuth(true);
                reset();
              }}
            >
              {t("SettingPanel.showAuth")}
            </span>
          </Box>
          <Box className="text-lg mt-8 mb-20">
            <HStack spacing={8}>
              <span className="text-grayModern-500">
                <HiOutlineDeviceMobile className="inline-block" />
                {t("SettingPanel.Tel")}:
              </span>
              <span>{userInfo?.phone ? userInfo.phone : t("NoInfo")}</span>
            </HStack>
            <HStack spacing={8} className="mt-2">
              <span className="text-grayModern-500">
                <TbCalendarTime className="inline-block mr-[2px]" />
                {t("SettingPanel.Registered")}:
              </span>
              <span>{formatDate(userInfo?.createdAt)}</span>
            </HStack>
          </Box>
        </>
      )}
    </div>
  );
}
