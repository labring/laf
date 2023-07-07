import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { HamburgerIcon, MoonIcon, SunIcon } from "@chakra-ui/icons";
import { Menu, MenuButton, MenuItem, MenuList, useColorMode } from "@chakra-ui/react";
import clsx from "clsx";

import { ChatIcon, ContactIcon, TextIcon } from "@/components/CommonIcon";
import { COLOR_MODE } from "@/constants";
import { getAvatarUrl } from "@/utils/getAvatarUrl";

import UserSetting from "../../pages/app/setting/UserSetting";

import UserBalance from "./UserBalance";

import useGlobalStore from "@/pages/globalStore";
import Language from "@/pages/homepage/language";

const Header = (props: { width: string }) => {
  const { width } = props;
  const { t } = useTranslation();
  const { userInfo } = useGlobalStore((state) => state);

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
    {
      text: t("HomePage.NavBar.contact"),
      ref: "https://www.wenjuan.com/s/I36ZNbl/",
      icon: <ContactIcon />,
    },
  ];

  useEffect(() => {
    if (window.location.href.includes("function-templates")) {
      setChosenItem("templateMarket");
    }
  }, []);

  function isMobileDevice() {
    const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
    return mobileRegex.test(navigator.userAgent);
  }

  return (
    <>
      {!isMobileDevice() ? (
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
                    item.value === chosenItem && !darkMode
                      ? "font-semibold text-grayModern-900"
                      : "",
                    item.value === chosenItem && darkMode
                      ? "font-semibold text-grayModern-100"
                      : "",
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
            <UserBalance />
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
                  avatar={getAvatarUrl(userInfo?._id || "")}
                  width={"2.25rem"}
                />
              </>
            ) : null}
          </div>
        </div>
      ) : (
        <div
          className={clsx(
            "flex h-[52px] w-full justify-between font-medium",
            { [width]: !!width },
            darkMode ? "" : "text-grayModern-600",
          )}
        >
          <div className="mt-3 flex w-full items-center px-5">
            <Menu>
              <MenuButton>
                <HamburgerIcon w={7} h={7} />
              </MenuButton>
              <MenuList minW={"150px"}>
                {navList_left.map((item, index) => {
                  return (
                    <MenuItem key={index}>
                      <a
                        target={item.ref.startsWith("http") ? "_blank" : "_self"}
                        href={item.ref}
                        className={clsx(
                          "mr-8 text-lg",
                          item.value === chosenItem && !darkMode
                            ? "font-semibold text-grayModern-900"
                            : "",
                          item.value === chosenItem && darkMode
                            ? "font-semibold text-grayModern-100"
                            : "",
                        )}
                        rel="noreferrer"
                      >
                        {item.text}
                      </a>
                    </MenuItem>
                  );
                })}
                {navList_right.map((item, index) => {
                  return (
                    <MenuItem key={index}>
                      <a
                        target={item.ref.startsWith("http") ? "_blank" : "_self"}
                        href={item.ref}
                        className="flex items-center text-lg"
                        rel="noreferrer"
                      >
                        <span className={clsx("pr-2")}>{item.icon}</span>
                        <span>{item.text}</span>
                      </a>
                    </MenuItem>
                  );
                })}
              </MenuList>
            </Menu>
            <a href="/" className="pl-3">
              <img
                src={darkMode ? "/logo_light.png" : "/logo_text.png"}
                className="mr-9 h-auto w-20"
                alt={"logo"}
              />
            </a>
            <div
              className="ml-auto mr-3 flex cursor-pointer justify-end"
              onClick={() => {
                toggleColorMode();
                window.dispatchEvent(new Event("ColorModeChange"));
              }}
            >
              {darkMode ? <MoonIcon /> : <SunIcon w={7} h={7} />}
            </div>
            {userInfo?._id ? (
              <>
                <UserSetting
                  name={userInfo?.username!}
                  avatar={getAvatarUrl(userInfo?._id || "")}
                  width={"1.95rem"}
                />
              </>
            ) : null}
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
