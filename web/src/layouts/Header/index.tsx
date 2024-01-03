import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { HStack, useColorMode } from "@chakra-ui/react";
import clsx from "clsx";

import ColorModeSwitch from "@/components/ColorModeSwitch";
import { ChatIcon, DocIcon } from "@/components/CommonIcon";
import LanguageSwitch from "@/components/LanguageSwitch";
import { Logo, LogoText } from "@/components/LogoIcon";
import { COLOR_MODE, Routes } from "@/constants";
import { getAvatarUrl } from "@/utils/getAvatarUrl";

import UserSetting from "../../pages/app/setting/UserSetting";

import useGlobalStore from "@/pages/globalStore";
import useSiteSettingStore from "@/pages/siteSetting";

const Header = (props: { className?: string }) => {
  const { className } = props;
  const { t } = useTranslation();
  const { userInfo, avatarUpdatedAt } = useGlobalStore((state) => state);
  const { siteSettings } = useSiteSettingStore();
  const navigate = useNavigate();
  const { colorMode } = useColorMode();
  const darkMode = colorMode === COLOR_MODE.dark;

  const navList_left = [
    { text: t("HomePage.NavBar.dashboard"), ref: Routes.dashboard },
    { text: t("HomePage.NavBar.funcTemplate"), ref: Routes.templates },
  ];
  const navList_right = [
    {
      text: t("HomePage.NavBar.docs"),
      ref: siteSettings.laf_doc_url?.value,
      icon: <DocIcon boxSize={5} />,
    },
    {
      text: t("HomePage.NavBar.forum"),
      ref: siteSettings.laf_forum_url?.value,
      icon: <ChatIcon boxSize={5} />,
    },
  ];

  return (
    <div
      className={clsx(
        "flex h-[52px] w-full justify-between pl-8 pr-5 text-lg !font-medium",
        className,
        darkMode ? "" : "text-grayIron-700",
      )}
    >
      <HStack spacing={4}>
        <span
          className="mr-5 flex cursor-pointer items-center space-x-2.5"
          onClick={() => {
            navigate("/");
          }}
        >
          <Logo size="28px" innerColor="white" outerColor="#00BAA4" />
          <LogoText size="35px" color={darkMode ? "#00BAA4" : "#021513"} />
        </span>

        {navList_left.map((item) => {
          return (
            <span
              key={item.text}
              className={clsx(
                "cursor-pointer rounded px-2 py-1",
                darkMode ? "hover:bg-grayIron-200/5" : "hover:bg-grayIron-700/5",
              )}
              onClick={() => {
                navigate(item.ref);
              }}
            >
              {item.text}
            </span>
          );
        })}
      </HStack>

      <HStack spacing={4}>
        {navList_right.map((item) => {
          if (!item.ref) return null;
          return (
            <span
              key={item.text}
              className={clsx(
                "flex cursor-pointer items-center space-x-2 rounded px-2 py-1",
                darkMode ? "hover:bg-grayIron-200/5" : "hover:bg-grayIron-700/5",
              )}
              onClick={() => {
                window.open(item.ref);
              }}
            >
              {item.icon}
              <p>{item.text}</p>
            </span>
          );
        })}
        <LanguageSwitch
          className={darkMode ? "hover:bg-grayIron-200/5" : "hover:bg-grayIron-700/5"}
        />
        <ColorModeSwitch
          className={clsx(
            "ml-4 mr-6 rounded p-2",
            darkMode ? "hover:bg-grayIron-200/5" : "hover:bg-grayIron-700/5",
          )}
        />
        {userInfo?._id ? (
          <span className="!ml-6">
            <UserSetting
              name={userInfo?.username!}
              avatar={getAvatarUrl(userInfo?._id, avatarUpdatedAt)}
              width="2rem"
            />
          </span>
        ) : null}
      </HStack>
    </div>
  );
};

export default Header;
