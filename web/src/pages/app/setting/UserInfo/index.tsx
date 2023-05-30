import { useState } from "react";
import { Avatar, Box, HStack } from "@chakra-ui/react";
import { t } from "i18next";

import ChargeButton from "@/components/ChargeButton";
import { formatDate, hidePhoneNumber } from "@/utils/format";

import AuthDetail from "./AuthDetail";

import useGlobalStore from "@/pages/globalStore";
import { useAccountQuery } from "@/pages/home/service";
export default function UserInfo() {
  const [showAuth, setShowAuth] = useState(false);

  const { userInfo } = useGlobalStore((state) => state);
  const { data: accountRes } = useAccountQuery();

  return (
    <div className="flex min-h-[400px] flex-col">
      {showAuth ? (
        <AuthDetail
          onBack={() => {
            setShowAuth(false);
          }}
        />
      ) : (
        <>
          <h1 className="mb-4 text-2xl font-bold">{t("SettingPanel.UserInfo")}</h1>
          {/*  <div className="relative flex items-center">
            <span className="inline-block px-2 h-[24px]  rounded-full border border-grayModern-400 text-grayModern-400 pt-[1px]">
              {t("SettingPanel.noAuth")}
            </span>
            <span
              className="absolute min-w-[70px] mt-1 text-blue-700 cursor-pointer inline-block"
              onClick={() => {
                setShowAuth(true);
              }}
            >
              {t("SettingPanel.showAuth")}
            </span>
          </div> */}
          <Box className="text-lg">
            <HStack>
              <span className=" text-grayModern-500">{t("SettingPanel.Avatar")}:</span>
              <Avatar
                size={"xs"}
                name={userInfo?.username}
                src={userInfo?.profile?.avatar}
                bgColor="primary.500"
                color="white"
                boxShadow="base"
              />
            </HStack>

            <HStack className="mt-4">
              <span className=" text-grayModern-500">{t("Balance")}:</span>
              <span>{accountRes?.data?.balance}</span>
              <ChargeButton>
                <span className="cursor-pointer text-blue-800">{t("ChargeNow")}</span>
              </ChargeButton>
            </HStack>

            <HStack className="mt-4">
              <span className=" text-grayModern-500">{t("SettingPanel.UserName")}:</span>
              <span>{userInfo?.username}</span>
            </HStack>

            <HStack className="mt-4">
              <span className=" text-grayModern-500">{t("SettingPanel.Email")}:</span>
              <span>{userInfo?.email ? userInfo?.email : "-"}</span>
            </HStack>

            <HStack className="mt-4">
              <span className=" text-grayModern-500">{t("SettingPanel.Tel")}:</span>
              <span>{userInfo?.phone ? hidePhoneNumber(userInfo.phone) : t("NoInfo")}</span>
            </HStack>

            <HStack className="mt-4">
              <span className=" text-grayModern-500">{t("SettingPanel.Registered")}:</span>
              <span>{formatDate(userInfo?.createdAt)}</span>
            </HStack>
          </Box>
        </>
      )}
    </div>
  );
}
