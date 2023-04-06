import { useState } from "react";
import { Avatar, Box, HStack, useColorMode } from "@chakra-ui/react";
import clsx from "clsx";
import { t } from "i18next";

import { formatDate } from "@/utils/format";

import AuthDetail from "./AuthDetail";

import useGlobalStore from "@/pages/globalStore";
export default function UserInfo() {
  const [showAuth, setShowAuth] = useState(false);

  const { userInfo } = useGlobalStore((state) => state);
  const { colorMode } = useColorMode();
  const darkMode = colorMode === "dark";

  return (
    <div className="flex h-full flex-col items-center justify-center">
      {showAuth ? (
        <AuthDetail
          onBack={() => {
            setShowAuth(false);
          }}
        />
      ) : (
        <>
          <Box className="relative text-center">
            <Avatar
              size="lg"
              name={userInfo?.username}
              src={userInfo?.profile.avatar}
              bgColor="primary.500"
              color="white"
              boxShadow="base"
            />
            <p
              className={clsx("mb-2 text-center text-3xl font-medium", {
                "text-grayModern-900": !darkMode,
              })}
            >
              {userInfo?.username}
            </p>
            {/* <span className="inline-block px-2 h-[24px]  rounded-full border border-grayModern-400 text-grayModern-400 pt-[1px]">
              {t("SettingPanel.noAuth")}
            </span>
            <span
              className="absolute min-w-[70px] mt-1 text-blue-700 cursor-pointer inline-block"
              onClick={() => {
                setShowAuth(true);
              }}
            >
              {t("SettingPanel.showAuth")}
            </span> */}
          </Box>
          <Box className="mb-20 mt-8 text-lg">
            <HStack spacing={8}>
              <span className="w-[80px] text-grayModern-500">{t("SettingPanel.Tel")}:</span>
              <span>{userInfo?.phone ? userInfo.phone : t("NoInfo")}</span>
            </HStack>
            <HStack spacing={8} className="mt-2">
              <span className="w-[80px] text-grayModern-500">{t("SettingPanel.Registered")}:</span>
              <span>{formatDate(userInfo?.createdAt)}</span>
            </HStack>
          </Box>
        </>
      )}
    </div>
  );
}
