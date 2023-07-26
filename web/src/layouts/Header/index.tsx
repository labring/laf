import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { MoonIcon, SunIcon } from "@chakra-ui/icons";
import { useColorMode } from "@chakra-ui/react";
import clsx from "clsx";

import { ChatIcon, TextIcon } from "@/components/CommonIcon";
import { COLOR_MODE } from "@/constants";
import { getAvatarUrl } from "@/utils/getAvatarUrl";

import UserSetting from "../../pages/app/setting/UserSetting";

import useGlobalStore from "@/pages/globalStore";
import Language from "@/pages/homepage/language";

const Header = (props: { width: string }) => {
  const { width } = props;
  const { t } = useTranslation();
  const { userInfo, avatarUpdatedAt } = useGlobalStore((state) => state);

  const { colorMode } = useColorMode();
  const darkMode = colorMode === COLOR_MODE.dark;
  const { toggleColorMode } = useColorMode();
  const [chosenItem, setChosenItem] = useState<string>("");

  const navList_left = [
    { text: t("HomePage.NavBar.dashboard"), ref: "/dashboard" },
    {
      text: t("HomePage.NavBar.funcTemplate"),
      ref: "/market/templates/recommended",
      value: "templateMarket",
    },
    // { text: t("HomePage.NavBar.appMarket"), ref: "/function-templates" },
  ];
  const navList_right = [
    { text: t("HomePage.NavBar.docs"), ref: String(t("HomePage.DocsLink")), icon: <TextIcon /> },
    {
      text: t("HomePage.NavBar.forum"),
      ref: "https://forum.laf.run/",
      icon: <ChatIcon color={darkMode ? "#FFFFFF" : "#5A646E"} />,
    },
  ];

  useEffect(() => {
    if (window.location.href.includes("function-templates")) {
      setChosenItem("templateMarket");
    }
  }, []);

  return (
    <>
      <div
        className={clsx(
          "flex h-[52px] w-full justify-between font-medium",
          { [width]: !!width },
          darkMode ? "" : "text-grayModern-600",
        )}
      >
        <div className="flex items-center pl-12">
          <a href="/">
            <img
              src={darkMode ? "/logo_light.png" : "/logo_text.png"}
              className="mr-9 h-auto w-20"
              alt={"logo"}
            />
          </a>

          {navList_left.map((item, index) => {
            return (
              <a
                key={index}
                target={item.ref.startsWith("http") ? "_blank" : "_self"}
                href={item.ref}
                className={clsx(
                  "mr-8 text-lg",
                  item.value === chosenItem && !darkMode ? "font-semibold text-grayModern-900" : "",
                  item.value === chosenItem && darkMode ? "font-semibold text-grayModern-100" : "",
                )}
                rel="noreferrer"
              >
                {item.text}
              </a>
            );
          })}
        </div>

        <div className="flex items-center pr-9">
          {navList_right.map((item, index) => {
            return (
              <a
                key={index}
                target={item.ref.startsWith("http") ? "_blank" : "_self"}
                href={item.ref}
                className="mr-8 flex items-center text-lg"
                rel="noreferrer"
              >
                <span className={clsx("pr-2", index !== 1 && "pb-1")}>{item.icon}</span>
                <span>{item.text}</span>
              </a>
            );
          })}
          <Language fontSize={20} />
          <div
            className="mr-8 cursor-pointer pb-1"
            onClick={() => {
              toggleColorMode();
              window.dispatchEvent(new Event("ColorModeChange"));
            }}
          >
            {darkMode ? <MoonIcon /> : <SunIcon boxSize={4} />}
          </div>
          {userInfo?._id ? (
            <>
              <UserSetting
                name={userInfo?.username!}
                avatar={getAvatarUrl(userInfo?._id, avatarUpdatedAt)}
                width={"2.25rem"}
              />
            </>
          ) : null}
        </div>
      </div>
    </>
  );
};

export default Header;
