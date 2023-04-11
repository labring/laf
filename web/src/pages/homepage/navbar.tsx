import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import axios from "axios";

import { Routes } from "@/constants";

import Language from "./language";

type Props = {};

const Navbar = (props: Props) => {
  const [showBanner, setShowBanner] = useState(false);
  const [toggleSidebar, setToggleSidebar] = useState(false);
  const [stars, setStars] = useState<string | null>(null);
  const { t } = useTranslation();

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
    <div className=" flex flex-col items-center justify-center">
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
            ? "fixed top-12 z-40  hidden w-full justify-center bg-white px-28 py-4 lg:flex "
            : "fixed top-0 z-40  hidden w-full justify-center bg-white px-28 py-4 lg:flex"
        }
      >
        <div className="flex w-full max-w-[1200px] justify-between">
          <div className="flex items-center">
            <div>
              <img src="/homepage/logo_text.png" className="h-auto w-20" alt={"logo"} />
            </div>
            <a href="/" className="ml-10">
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
            </a>
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
                  src="/homepage/github.svg"
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
            ? "fixed top-12 z-40 flex w-full justify-between bg-white px-8 py-4 lg:hidden "
            : "fixed top-0 z-40 flex w-full justify-between bg-white px-8 py-4 lg:hidden "
        }
      >
        <img className="h-10" src="/homepage/logo_text.png" alt="logo" />

        <img
          className="w-8 hover:cursor-pointer"
          src="/homepage/menu.svg"
          alt="menu"
          onClick={() => setToggleSidebar(!toggleSidebar)}
        />
      </div>
      {toggleSidebar && (
        <div
          id="dropdown"
          className={
            showBanner
              ? "fixed right-4 top-28 z-40 block w-28 divide-y divide-gray-100 rounded-lg bg-white shadow lg:hidden "
              : "fixed right-4 top-16 z-40 block w-28 divide-y divide-gray-100 rounded-lg bg-white shadow lg:hidden "
          }
        >
          <ul
            className="text-sm  divide-y divide-gray-100 py-2 text-gray-700 "
            aria-labelledby="dropdownDefaultButton"
          >
            <div>
              <li>
                <a href="/homepage/" className="block px-4 py-2 hover:bg-gray-100 ">
                  主页
                </a>
              </li>
              <li>
                <a
                  target="_blank"
                  href="https://docs.laf.dev"
                  className="block px-4 py-2 hover:bg-gray-100"
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
              </li>
            </div>
            <div>
              {stars ? (
                <a
                  href="https://github.com/labring/laf"
                  className="flex px-4 py-2 hover:bg-gray-100 "
                >
                  <img className="pr-2" src="/homepage/github.svg" alt="github" />
                  {stars}
                </a>
              ) : null}

              <a href="#" className="flex px-4 py-2 hover:bg-gray-100 ">
                <Language />
              </a>
            </div>
          </ul>
        </div>
      )}
    </div>
  );
};

export default Navbar;
