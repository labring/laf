import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useColorMode } from "@chakra-ui/react";
import axios from "axios";
import clsx from "clsx";

import { GithubIcon, MenuIcon } from "@/components/CommonIcon";
import { COLOR_MODE, Routes, site_url } from "@/constants";

import LanguageSwitch from "../../components/LanguageSwitch";
import useSiteSettingStore from "../siteSetting";

const Navbar = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [toggleSidebar, setToggleSidebar] = useState(false);
  const [stars, setStars] = useState<string | null>(null);
  const { t } = useTranslation();
  const { siteSettings } = useSiteSettingStore();
  const navList = [
    {
      text: t("HomePage.NavBar.docs"),
      ref: siteSettings.laf_doc_url?.value,
    },
    {
      text: t("HomePage.NavBar.forum"),
      ref: siteSettings.laf_forum_url?.value,
    },
    {
      text: t("HomePage.NavBar.contact"),
      ref: siteSettings.laf_business_url?.value,
    },
  ];
  const { colorMode } = useColorMode();
  const darkMode = colorMode === COLOR_MODE.dark;

  useEffect(() => {
    const expirationTime = 24 * 60 * 60 * 1000;
    const lastCanceledTime: string | null = localStorage.getItem("lastCanceledTime");
    const now = new Date().getTime();
    // console.log("now:",now,"last",lastCanceledTime);
    //如果本地已经存有上次的删除时间，且小于24h，则不显示banner
    if (lastCanceledTime && now - Number(lastCanceledTime) < expirationTime) {
      setShowBanner(false);
    } else {
      //没有本地的删除时间，或者已经大于24h，显示banner
      setShowBanner(true);
    }
  }, []);

  useEffect(() => {
    (async () => {
      const axiosRes = await axios.get(
        "https://img.shields.io/github/stars/labring/laf?style=plastic",
      );
      const str = axiosRes.data;
      const reg = /(\d+(\.\d+)?)(k)/;
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
    <div className="flex flex-col items-center justify-center">
      <div className={showBanner ? "fixed top-0  z-40 block" : "hidden"}>
        <div className="flex h-12 w-screen items-center justify-center bg-[url('/homepage/banner.png')] bg-center lg:px-32">
          <a
            className="whitespace-nowrap text-[6px] text-white lg:text-xl"
            target="_blank"
            href={site_url.laf_github}
            rel="noreferrer"
          >
            {t("HomePage.NavBar.title")}
          </a>
        </div>
        <img
          className="absolute right-4 top-3 z-40 hover:cursor-pointer lg:right-36 "
          src="/homepage/cancel_btn.svg"
          alt={"cancel"}
          onClick={() => {
            setShowBanner(false);
            localStorage.setItem("lastCanceledTime", new Date().getTime().toString());
          }}
        />
      </div>
      <div
        className={
          showBanner
            ? clsx("fixed top-12 z-40  hidden w-full justify-center px-28 py-4 lg:flex", {
                "bg-lafDark-100": darkMode,
                "bg-lafWhite-600": !darkMode,
              })
            : clsx("fixed top-0 z-40  hidden w-full justify-center px-28 py-4 lg:flex", {
                "bg-lafDark-100": darkMode,
                "bg-lafWhite-600": !darkMode,
              })
        }
      >
        <div className="flex w-full max-w-[1200px] justify-between">
          <div className="flex items-center">
            <div className="flex items-center space-x-2">
              <img
                src={darkMode ? "sealos-logo.svg" : "sealos-logo.svg"}
                className="h-8 w-auto"
                alt="logo"
              />
              <span className="text-lg"> {t("app.logo")}</span>
            </div>

            {navList.map((item, index) => {
              if (!item.ref) return null;
              return (
                <a
                  key={index}
                  target={item.ref.startsWith("http") ? "_blank" : "_self"}
                  href={item.ref}
                  className="ml-10"
                  rel="noreferrer"
                >
                  {item.text}
                </a>
              );
            })}
          </div>
          <div className="flex w-80 items-center justify-evenly">
            {stars ? (
              <a href={site_url.laf_github} target="_blank" className="flex" rel="noreferrer">
                <GithubIcon
                  className="mr-1"
                  fontSize={24}
                  color={darkMode ? "#F6F8F9" : "#3C455D"}
                />
                {stars}
              </a>
            ) : null}
            <div className="hover:opacity-75">
              <LanguageSwitch className="text-xl !font-normal" size="24px" color="#1A202C" />
            </div>
            <div>
              <Link
                to={Routes.dashboard}
                className="bg-primary text-sm rounded px-5 py-2 text-white"
              >
                {t("HomePage.NavBar.start")}
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div
        className={
          showBanner
            ? clsx("fixed top-12 z-40 flex w-full justify-between px-8 py-4 lg:hidden", {
                "bg-lafDark-100": darkMode,
                "bg-lafWhite-600": !darkMode,
              })
            : clsx("fixed top-0 z-40 flex w-full justify-between px-8 py-4 lg:hidden", {
                "bg-lafDark-100": darkMode,
                "bg-lafWhite-600": !darkMode,
              })
        }
      >
        <img className="h-10" src={darkMode ? "logo_light.png" : "logo_text.png"} alt="logo" />

        <MenuIcon
          fontSize={32}
          color={darkMode ? "#F6F8F9" : "#3C455D"}
          onClick={() => setToggleSidebar(!toggleSidebar)}
        />
      </div>
      {toggleSidebar && (
        <div
          id="dropdown"
          className={
            showBanner
              ? clsx(
                  "fixed right-4 top-28 z-40 block w-28 divide-y divide-gray-100 rounded-lg shadow lg:hidden",
                  {
                    "bg-lafDark-300 text-lafWhite-600": darkMode,
                    "bg-lafWhite-600 text-gray-700": !darkMode,
                  },
                )
              : clsx(
                  "fixed right-4 top-16 z-40 block w-28 divide-y divide-gray-100 rounded-lg shadow lg:hidden",
                  {
                    "bg-lafDark-300 text-lafWhite-600": darkMode,
                    "bg-lafWhite-600 text-gray-700": !darkMode,
                  },
                )
          }
        >
          <ul
            className="text-sm divide-y divide-gray-100 py-2"
            aria-labelledby="dropdownDefaultButton"
          >
            <div>
              {navList.map((item, index) => {
                if (!item.ref) return null;
                return (
                  <li key={index}>
                    <a
                      href={item.ref}
                      target={item.ref.startsWith("http") ? "_blank" : "_self"}
                      className={
                        darkMode
                          ? "block px-4 py-2 hover:bg-gray-900"
                          : "block px-4 py-2 hover:bg-gray-100"
                      }
                      rel="noreferrer"
                    >
                      {item.text}
                    </a>
                  </li>
                );
              })}
            </div>
            <div>
              {stars ? (
                <a
                  href={site_url.laf_github}
                  className={
                    darkMode
                      ? "flex px-4 py-2 hover:bg-gray-900"
                      : "flex px-4 py-2 hover:bg-gray-100"
                  }
                >
                  <GithubIcon fontSize={24} color={darkMode ? "#F6F8F9" : "#3C455D"} />
                  {stars}
                </a>
              ) : null}

              <div
                className={
                  darkMode ? "flex px-4 py-2 hover:bg-gray-900" : "flex px-4 py-2 hover:bg-gray-100"
                }
              >
                <LanguageSwitch className="text-[24px]" />
              </div>
            </div>
          </ul>
        </div>
      )}
    </div>
  );
};

export default Navbar;
