import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useColorMode } from "@chakra-ui/react";
import axios from "axios";
import clsx from "clsx";

import { Routes } from "@/constants";

import Language from "./language";

type Props = {};

const Navbar = (props: Props) => {
  const [showBanner, setShowBanner] = useState(false);
  const [toggleSidebar, setToggleSidebar] = useState(false);
  const [stars, setStars] = useState<string | null>(null);
  const { t } = useTranslation();
  const navList = [
    { text: t("HomePage.NavBar.home"), ref: "/" },
    { text: t("HomePage.NavBar.docs"), ref: String(t("HomePage.DocsLink")) },
    { text: t("HomePage.NavBar.forum"), ref: "https://forum.laf.run/" },
    { text: t("HomePage.NavBar.contact"), ref: "https://www.wenjuan.com/s/I36ZNbl/" },
  ];
  const { colorMode } = useColorMode();
  const darkMode = colorMode === "dark";

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

      const reg = /textLength="250">(.*?)k<\/text>/;
      const match = str.match(reg);

      if (match) {
        const matchedText = match[1];
        setStars(`${matchedText}K`);
        console.log(matchedText); // 输出：4k
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
            href="https://github.com/labring/laf"
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
            <div>
              <img
                src={darkMode ? "logo_light.png" : "logo_text.png"}
                className="h-auto w-20"
                alt={"logo"}
              />
            </div>
            {/* <a href="/" className="ml-10">
              {t("HomePage.NavBar.home")}
            </a>
            <a
              target="_blank"
              href={String(t("HomePage.DocsLink"))}
              className="ml-10"
              rel="noreferrer"
            >
              {t("HomePage.NavBar.docs")}
            </a>
            <a href="https://forum.laf.run/" target="_blank" className="ml-10" rel="noreferrer">
              {t("HomePage.NavBar.forum")}
            </a>
            <a
              target="_blank"
              href="https://www.wenjuan.com/s/I36ZNbl/"
              className="ml-10"
              rel="noreferrer"
            >
              {t("HomePage.NavBar.contact")}
            </a> */}
            {navList.map((item, index) => {
              return (
                <a key={index} target="_blank" href={item.ref} className="ml-10" rel="noreferrer">
                  {item.text}
                </a>
              );
            })}
          </div>
          <div className="flex w-80 items-center justify-evenly">
            {stars ? (
              <a
                href="https://github.com/labring/laf"
                target="_blank"
                className="flex"
                rel="noreferrer"
              >
                <img
                  alt="github"
                  src={darkMode ? "/homepage/dark/github.svg" : "/homepage/github.svg"}
                  width={24}
                  height={24}
                  className="mr-1"
                />
                {stars}
              </a>
            ) : null}

            <div className="flex justify-evenly">
              <Language />
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
            ? // ? "fixed top-12 z-40 flex w-full justify-between px-8 py-4 lg:hidden "
              clsx("fixed top-12 z-40 flex w-full justify-between px-8 py-4 lg:hidden", {
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

        <img
          className="w-8 hover:cursor-pointer"
          src={darkMode ? "/homepage/dark/menu.svg" : "/homepage/menu.svg"}
          alt="menu"
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
              {/* <li>
                <a href="/homepage/" className="block px-4 py-2">
                  {t("HomePage.NavBar.home")}
                </a>
              </li>
              <li>
                <a
                  target="_blank"
                  href="https://doc.laf.dev"
                  className="block px-4 py-2"
                  rel="noreferrer"
                >
                  {t("HomePage.NavBar.docs")}
                </a>
              </li>
              <li>
                <a
                  href="https://forum.laf.run/"
                  target="_blank"
                  className="block px-4 py-2 hover:bg-gray-100"
                  rel="noreferrer"
                >
                  {t("HomePage.NavBar.forum")}
                </a>
              </li>
              <li>
                <a
                  target="_blank"
                  href="https://www.wenjuan.com/s/I36ZNbl/"
                  className="block px-4 py-2 hover:bg-gray-100"
                  rel="noreferrer"
                >
                  {t("HomePage.NavBar.contact")}
                </a>
              </li> */}
              {navList.map((item, index) => {
                return (
                  <li>
                    <a
                      key={index}
                      href={item.ref}
                      target="_blank"
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
                  href="https://github.com/labring/laf"
                  // className="flex px-4 py-2 hover:bg-gray-100"
                  className={
                    darkMode
                      ? "flex px-4 py-2 hover:bg-gray-900"
                      : "flex px-4 py-2 hover:bg-gray-100"
                  }
                >
                  <img
                    className="pr-2"
                    src={darkMode ? "/homepage/dark/github.svg" : "/homepage/github.svg"}
                    alt="github"
                  />
                  {stars}
                </a>
              ) : null}

              <div
                className={
                  darkMode ? "flex px-4 py-2 hover:bg-gray-900" : "flex px-4 py-2 hover:bg-gray-100"
                }
              >
                <Language />
              </div>
            </div>
          </ul>
        </div>
      )}
    </div>
  );
};

export default Navbar;
