/****************************
 * laf website header nav
 ***************************/

import { useTranslation } from "react-i18next";
import { FiGithub } from "react-icons/fi";
import { useColorMode } from "@chakra-ui/react";

import { MarketIcon } from "@/components/CommonIcon";
import { COLOR_MODE } from "@/constants";

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
            src={colorMode === COLOR_MODE.dark ? "/logo_light.png" : "/logo_light.png"}
            alt="logo"
            className="mr-4 h-[40px]"
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
        <a
          href="/market"
          className="mx-4 flex items-center border-r-2 border-grayModern-400 px-4 text-xl"
        >
          <MarketIcon color={"#5A646E"} />
          <span className="pl-2 text-grayModern-600">{t("market.market")}</span>
        </a>
        {userInfo?._id ? (
          <>
            <UserSetting
              name={userInfo?.username!}
              avatar={userInfo?.profile?.avatar}
              width={"24px"}
            />
          </>
        ) : null}
      </div>
    </div>
  );
}
