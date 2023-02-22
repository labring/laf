import { useState } from "react";
import { HiOutlineDeviceMobile } from "react-icons/hi";
import { TbCalendarTime } from "react-icons/tb";
import { Avatar, Box, HStack } from "@chakra-ui/react";
import { t } from "i18next";

import { formatDate } from "@/utils/format";

import AuthDetail from "./AuthDetail";

import useGlobalStore from "@/pages/globalStore";
export default function UserInfo() {
  const [showAuth, setShowAuth] = useState(false);

  const { userInfo } = useGlobalStore((state) => state);

  return (
    <div className="h-full flex flex-col items-center justify-center">
      {showAuth ? (
        <AuthDetail
          onBack={() => {
            setShowAuth(false);
          }}
        />
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
