/****************************
 * laf website header nav
 ***************************/

import { useTranslation } from "react-i18next";
import { FiGithub } from "react-icons/fi";
import { useColorMode } from "@chakra-ui/react";

import UserSetting from "./UserSetting";

import useGlobalStore from "@/pages/globalStore";

export default function Header(props: { size: "sm" | "lg" }) {
  const { userInfo } = useGlobalStore((state) => state);
  const { t } = useTranslation();
  const { colorMode } = useColorMode();

  return (
    <div className="flex h-[60px] justify-between px-10 py-4">
      <div className="flex items-center">
        <a href="/">
          <img
            src={colorMode === "dark" ? "/logo_light.png" : "/logo_light.png"}
            alt="logo"
            width={80}
            className="mr-4"
          />
        </a>
        <a
          href="https://github.com/labring/laf"
          className="ml-2 flex items-center rounded-md bg-white p-2 py-1 text-base text-gray-700 hover:text-black"
          target={"_blank"}
          rel="noreferrer"
        >
          <FiGithub />
          <span className="ml-1">{t("star-us-on-github")}</span>
        </a>
      </div>

      <div className="flex items-center">
        {userInfo?.profile ? (
          <>
            <UserSetting
              name={userInfo?.profile?.name}
              avatar={userInfo?.profile?.avatar}
              width={"24px"}
            />
          </>
        ) : null}
      </div>
    </div>
  );
}
