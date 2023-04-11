import React from "react";
import { useTranslation } from "react-i18next";

import Circle from "./circle";

type Props = {};

const JoinUs = (props: Props) => {
  const { t } = useTranslation();
  return (
    <div className="mt-32">
      <div className="relative mb-[120px] hidden h-auto w-full rounded-3xl  bg-[url('/homepage/joinbg.svg')] bg-cover bg-repeat lg:flex lg:flex-row">
        <div className="m-16 w-2/5">
          <div className=" mb-4 text-5xl leading-none text-white "> {t("HomePage.Join.title")}</div>
          <div className="mb-6 text-5xl text-white">{t("HomePage.Join.subtitle")}</div>
          <p className="mb-6 font-thin text-white">{t("HomePage.Join.content")}</p>

          <div className="flex justify-start gap-4">
            <a href="https://discord.gg/6VhVrsaS" target="_blank" rel="noreferrer">
              <div className="flex h-12 w-36 flex-row items-center	 justify-center gap-2 rounded-md border border-blue-200 border-opacity-30 bg-gradient-to-r from-[#394DFF1A] to-[#66E3FF33]">
                <img src="/homepage/discord.svg" alt="discord" />
                <p className="text-white">Discord</p>
              </div>
            </a>
            <a href="https://w4mci7-images.oss.laf.run/wechat.png" target="_blank" rel="noreferrer">
              <div className="flex h-12 w-36 flex-row items-center	 justify-center gap-2 rounded-md border border-green-200 border-opacity-30 bg-gradient-to-r from-[#2CE25E1A] to-[#1DFFD61A]">
                <img src="/homepage/wechat_02.svg" alt="wechat" />
                <p className="text-white">{t("HomePage.Join.WeChat")}</p>
              </div>
            </a>
            <a href="https://forum.laf.run/" target="_blank" rel="noreferrer">
              <div className="flex h-12 w-36 flex-row items-center	 justify-center gap-2 rounded-md border border-blue-300 border-opacity-30 bg-gradient-to-r from-[#0B9DFF1A] to-[#4FC67E1A]">
                <img src="/homepage/forum.svg" alt="forum" />
                <p className="text-white">{t("HomePage.Join.forum")}</p>
              </div>
            </a>
          </div>
        </div>
        <div className="h-[440px] w-1/2">
          <img
            className="absolute right-[255px] top-[198px] h-[64px] w-[64px]"
            src="/homepage/logo_icon.svg"
            alt="logo"
          />
          <div className="absolute right-72 top-48">
            <Circle />
          </div>
          <div className="absolute right-[450px] top-80 h-10 w-10 rounded-full bg-red-500 object-cover opacity-20"></div>
          <div className="absolute right-[600px] top-24 h-4 w-4 rounded-full bg-green-600 object-cover opacity-20"></div>
          <div className="absolute right-[100px] top-36 h-4 w-4 rounded-full bg-yellow-600 object-cover opacity-20"></div>
          <div className="absolute right-[420px] top-28 h-6 w-6 rounded-full bg-yellow-600 object-cover opacity-20"></div>

          <img
            className="hover:border-primary absolute right-32 top-64 h-12 w-12 rounded-full border object-cover"
            src="/homepage/p3.png"
            alt="p3"
          />
          <img
            className="hover:border-primary absolute right-48 top-28 h-12 w-12 rounded-full border object-cover"
            src="/homepage/p4.png"
            alt="p4"
          />
          <img
            className="hover:border-primary absolute right-80 top-32 h-12 w-12 rounded-full border object-cover"
            src="/homepage/p1.png"
            alt="p1"
          />
          <img
            className="hover:border-primary absolute right-72 top-72 h-12 w-12 rounded-full border object-cover"
            src="/homepage/p2.png"
            alt="p2"
          />
          <img
            className="hover:border-primary absolute right-[400px] top-48 h-12 w-12 rounded-full border object-cover"
            src="/homepage/p5.png"
            alt="p5"
          />
        </div>
      </div>
      <div className="relative mx-[16px] flex h-[650px] flex-col items-center rounded-3xl bg-[url('/homepage/bg.png')] bg-cover bg-repeat lg:hidden">
        <div className="] mb-4 mt-12 text-center text-4xl text-white">
          {t("HomePage.Join.title")}
        </div>
        <div className="mb-4 text-4xl text-white">{t("HomePage.Join.subtitle")}</div>
        <p className="mx-4 mb-8 text-center font-thin text-white">{t("HomePage.Join.content")}</p>
        <div className="flex justify-start gap-4">
          <a href="https://w4mci7-images.oss.laf.run/wechat.png" target="_blank" rel="noreferrer">
            <img className="w-6" src="/homepage/wechat_01.svg" alt="wechat" />
          </a>

          <a href="https://forum.laf.run/">
            <img className="w-6" src="/homepage/forum1.svg" alt="forum1" />
          </a>
          <a href="https://discord.gg/6VhVrsaS" target="_blank" rel="noreferrer">
            <img className="w-6" src="/homepage/discord_2.svg" alt="discord" />
          </a>
        </div>
        <div className="right-42 absolute bottom-48 w-[400px]">
          <div className="absolute bottom-[-50px] right-[150px] h-[100px]  w-[100px] rounded-full border border-white opacity-20" />
          <div className="absolute bottom-[-75px] right-[125px] h-[150px] w-[150px] rounded-full border border-gray-400 opacity-20" />
          <div className="absolute bottom-[-125px] right-[75px] h-[250px] w-[250px] rounded-full border border-gray-400 opacity-40" />
          <div className="absolute bottom-[-100px] right-[100px] h-[200px] w-[200px] rounded-full border border-gray-500 opacity-40" />
          <img
            className="absolute bottom-[-30px] right-[165px] h-[64px] w-[64px]"
            src="/homepage/logo_icon.svg"
            alt="logo"
          />
          <div className="absolute right-[280px] top-[120px] h-10 w-10 rounded-full bg-red-500 object-cover opacity-20"></div>
          <div className="absolute right-[50px] top-[-100px] h-4 w-4 rounded-full bg-green-600 object-cover opacity-20"></div>
          <div className="absolute right-[100px] top-36 h-4 w-4 rounded-full bg-yellow-600 object-cover opacity-20"></div>
          <div className="absolute right-[320px] top-[-150px] h-6 w-6 rounded-full bg-yellow-600 object-cover opacity-20"></div>
          <img
            className="hover:border-primary absolute bottom-[-100px]  right-[100px] h-10 w-10 rounded-full border object-cover"
            src="/homepage/p3.png"
            alt="p3"
          />
          <img
            className="hover:border-primary absolute bottom-[-50px]  right-[250px] h-10 w-10 rounded-full border object-cover"
            src="/homepage/p2.png"
            alt="p2"
          />
          <img
            className="hover:border-primary absolute bottom-[-120px]  right-[190px] h-10  w-10 rounded-full border object-cover"
            src="/homepage/p1.png"
            alt="p1"
          />
          <img
            className="hover:border-primary absolute bottom-[20px]  right-[80px] h-10  w-10 rounded-full border object-cover"
            src="/homepage/p4.png"
            alt="p4"
          />
          <img
            className="hover:border-primary absolute bottom-[40px]  right-[250px] h-10 w-10 rounded-full border object-cover"
            src="/homepage/p5.png"
            alt="p5"
          />
        </div>
      </div>
    </div>
  );
};

export default JoinUs;
