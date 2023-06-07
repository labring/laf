import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ChatIcon } from "@chakra-ui/icons";
import { useColorMode } from "@chakra-ui/react";
import axios from "axios";
import clsx from "clsx";

import { ContactIcon, GithubIcon } from "@/components/CommonIcon";
import { COLOR_MODE } from "@/constants";

import UserSetting from "./UserSetting";

import useGlobalStore from "@/pages/globalStore";
import Language from "@/pages/homepage/language";

const Header = (props: { bg: string }) => {
  const { bg } = props;
  const [stars, setStars] = useState<string | null>(null);
  const { t } = useTranslation();
  const { userInfo } = useGlobalStore((state) => state);
  const navList = [
    { text: t("HomePage.NavBar.home"), ref: "/" },
    { text: t("HomePage.NavBar.docs"), ref: String(t("HomePage.DocsLink")) },
    { text: t("HomePage.NavBar.funcTemplate"), ref: "/function-templates" },
    // { text: t("HomePage.NavBar.appMarket"), ref: "/function-templates" },
  ];
  const { colorMode } = useColorMode();
  const darkMode = colorMode === COLOR_MODE.dark;

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

  return (
    <div className={clsx("flex w-full justify-between py-2", darkMode ? "" : { [bg]: !!bg })}>
      <div className="flex items-center pl-8">
        <img
          src={darkMode ? "/logo_light.png" : "/logo_text.png"}
          className="h-auto w-20"
          alt={"logo"}
        />

        {navList.map((item, index) => {
          return (
            <a
              key={index}
              target={item.ref.startsWith("http") ? "_blank" : "_self"}
              href={item.ref}
              className="ml-10 text-lg"
              rel="noreferrer"
            >
              {item.text}
            </a>
          );
        })}
      </div>

      <div className="flex items-center pr-8">
        {stars ? (
          <a
            href="https://github.com/labring/laf"
            target="_blank"
            className="flex cursor-pointer items-center pr-4 text-lg"
            rel="noreferrer"
          >
            <GithubIcon className="mr-1" fontSize={24} color={darkMode ? "#F6F8F9" : "#3C455D"} />
            {stars}
          </a>
        ) : null}
        <Language />
        <a target="_blank" href="https://forum.laf.run/" rel="noreferrer">
          <ChatIcon className="mr-1" fontSize={20} color={darkMode ? "#F6F8F9" : "#3C455D"} />
          <span className="pl-1 pr-4 text-lg">{t("HomePage.NavBar.forum")}</span>
        </a>
        <a
          target="_blank"
          href="https://www.wenjuan.com/s/I36ZNbl/"
          rel="noreferrer"
          className="mr-4"
        >
          <ContactIcon className="mr-1" fontSize={20} color={darkMode ? "#F6F8F9" : "#3C455D"} />
          <span className="pl-1 text-lg">{t("HomePage.NavBar.contact")}</span>
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
};

export default Header;
