import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { Routes } from "@/constants";

import Video from "./video";

type Props = {};

const Hero = (props: Props) => {
  const [play, setPlay] = useState(false);
  const { t } = useTranslation();

  return (
    <>
      <div className="flex h-auto flex-col items-center overflow-hidden pt-36 lg:h-[720px] lg:pt-44">
        <h1 className="text-4xl lg:text-6xl">{t(`HomePage.HomePage.slogan`)}</h1>
        <p className="z-10 mt-8 px-10 text-center text-2xl lg:mt-5 lg:w-[600px]">
          {t(`HomePage.HomePage.content1`)}
          <br />
          {t(`HomePage.HomePage.content2`)}
        </p>

        <div className="z-10 mt-8 lg:mt-6">
          <Link
            to={Routes.dashboard}
            className="bg-primary  z-40 flex h-[48px] w-[144px] items-center justify-center rounded-md text-[16px] text-white hover:active:bg-[#00AFA3]"
          >
            {t(`HomePage.HomePage.start`)}
          </Link>
        </div>
        <div className="absolute top-[344px] mx-auto hidden h-[375px] w-[968px] justify-center bg-[url('/homepage/videobg.png')] bg-contain bg-center bg-no-repeat lg:flex">
          <img
            src="/homepage/play.svg"
            alt="play"
            className="absolute top-[200px] z-10 hover:cursor-pointer "
            onClick={() => setPlay(true)}
          />
        </div>
        <img
          className="h-[200px] w-[350px] object-cover hover:cursor-pointer lg:hidden"
          src="/homepage/videomobile.png"
          alt="video"
          onClick={() => setPlay(true)}
        />

        <div
          className={
            play
              ? "fixed inset-0 top-0 z-50 flex h-full w-full items-center justify-center bg-gray-600 bg-opacity-50"
              : " hidden"
          }
          id="my-modal"
        >
          <div className={play ? "relative top-10 mx-auto" : "hidden"}>
            <div className="relative mx-auto w-3/4">
              <button
                className="absolute right-0 top-0 z-20 pr-2 pt-2"
                onClick={() => setPlay(false)}
              >
                <img
                  width={24}
                  height={24}
                  className="rounded-2xl bg-black hover:cursor-pointer hover:bg-gray-600"
                  src="/homepage/cancel_btn.svg"
                  alt="cancel_btn"
                />
              </button>
              {play ? <Video /> : null}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Hero;
