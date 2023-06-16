import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { MoonIcon, SunIcon } from "@chakra-ui/icons";
import { useColorMode } from "@chakra-ui/react";
import axios from "axios";
import clsx from "clsx";

import { ChatIcon, ContactIcon, GithubIcon, TextIcon } from "@/components/CommonIcon";
import { COLOR_MODE } from "@/constants";

import UserSetting from "./UserSetting";

import useGlobalStore from "@/pages/globalStore";
import Language from "@/pages/homepage/language";

const Header = (props: { bg: string }) => {
  const { bg } = props;
  const [stars, setStars] = useState<string | null>(null);
  const { t } = useTranslation();
  const { userInfo } = useGlobalStore((state) => state);
  const { colorMode } = useColorMode();
  const darkMode = colorMode === COLOR_MODE.dark;
  const { toggleColorMode } = useColorMode();
  const [chosenItem, setChosenItem] = useState<string>("");

  const navList_left = [
    { text: t("HomePage.NavBar.home"), ref: "/dashboard" },
    {
      text: t("HomePage.NavBar.funcTemplate"),
      ref: "/market/templates/all",
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
    (async () => {
      const axiosRes = await axios.get(
        "https://img.shields.io/github/stars/labring/laf?style=plastic",
      );
      const str = axiosRes.data;

      const reg = /textLength="250">(.*?)k<\/text>/;
      const match = str.match(reg);

      if (match) {
        const matchedText = match[1];
        setStars(`${matchedText}K`);
      } else {
        console.log("No match found");
      }
    })();

    return () => {};
  }, []);

  useEffect(() => {
    if (window.location.href.includes("function-templates")) {
      setChosenItem("templateMarket");
    }
  }, []);

  return (
    <div
      className={clsx(
        "flex h-[52px] w-full justify-between font-medium",
        darkMode ? "" : { [bg]: !!bg },
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
        {stars ? (
          <a
            href="https://github.com/labring/laf"
            target="_blank"
            className="flex cursor-pointer items-center pr-7 text-lg"
            rel="noreferrer"
          >
            <GithubIcon className="mr-2" fontSize={24} color={darkMode ? "#F6F8F9" : "#3C455D"} />
            {stars}
          </a>
        ) : null}

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
              avatar={userInfo?.profile?.avatar}
              width={"2.25rem"}
            />
          </>
        ) : null}
      </div>
    </div>
  );
};

export default Header;
