import { useTranslation } from "react-i18next";
import { useColorMode } from "@chakra-ui/react";

import { DiscordIcon, ForumIcon, WechatIcon } from "@/components/CommonIcon";
import { COLOR_MODE, site_url } from "@/constants";

import useSiteSettingStore from "../siteSetting";

import Status from "./status";

type Props = {};

const Footer = (props: Props) => {
  const { t } = useTranslation();
  const { colorMode } = useColorMode();
  const darkMode = colorMode === COLOR_MODE.dark;

  const siteSettings = useSiteSettingStore((state) => state.siteSettings);

  return (
    <>
      <div
        className={
          darkMode
            ? "hidden justify-center bg-lafDark-200 lg:flex"
            : "hidden justify-center bg-lafWhite-600 lg:flex"
        }
      >
        <div className=" w-full max-w-[1200px] flex-col divide-y divide-solid divide-gray-200">
          <div className="py-[60px]">
            <div className="flex justify-between">
              <div className="w-1/2">
                <div className="flex items-center space-x-2">
                  <img
                    src={darkMode ? "sealos-logo.svg" : "sealos-logo.svg"}
                    className="h-8 w-auto"
                    alt="logo"
                  />
                  <span className="text-lg"> {t("app.logo")}</span>
                </div>

                <p
                  className={
                    darkMode
                      ? "mt-8 w-full max-w-[380px] text-base leading-5 text-lafWhite-700"
                      : "mt-8 w-full max-w-[380px] text-base leading-5 text-[#5E6987]"
                  }
                >
                  {t("HomePage.Footer.laf")}
                </p>
              </div>

              <div
                className={
                  darkMode
                    ? "w-1/6 text-lg leading-10 text-lafWhite-700"
                    : "w-1/6 text-lg leading-10 text-[#5E6987]"
                }
              >
                {t("HomePage.Footer.product")}
                <ul
                  className={
                    darkMode ? "leading-10 text-lafWhite-400" : "leading-10 text-[#14171F]"
                  }
                >
                  <li>
                    <a href={String(t(`HomePage.LafLink`))}>{t("HomePage.Footer.item1_1")}</a>
                  </li>
                  <li>
                    <a href={`${site_url.laf_github}/releases`} target="_blank" rel="noreferrer">
                      {t("HomePage.Footer.item1_3")}
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://marketplace.visualstudio.com/items?itemName=NightWhite.laf-assistant"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {t("HomePage.Footer.item1_4")}
                    </a>
                  </li>
                  <li>
                    <a href="https://github.com/labring/sealos" target="_blank" rel="noreferrer">
                      {t("HomePage.Footer.item1_2")}
                    </a>
                  </li>
                </ul>
              </div>
              <div
                className={
                  darkMode
                    ? "w-1/6 text-lg leading-10 text-lafWhite-700"
                    : "w-1/6 text-lg leading-10 text-[#5E6987]"
                }
              >
                {t("HomePage.Footer.developer")}
                <ul
                  className={
                    darkMode ? "leading-10 text-lafWhite-400" : "leading-10 text-[#14171F]"
                  }
                >
                  <li>
                    <a
                      href={`${site_url.laf_github}/tree/main/deploy`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {t("HomePage.Footer.item2_1")}
                    </a>
                  </li>
                  <li>
                    <a href="https://api.laf.dev/" target="_blank" rel="noreferrer">
                      {t("HomePage.Footer.item2_2")}
                    </a>
                  </li>
                  <li>
                    <a href={site_url.laf_github} target="_blank" rel="noreferrer">
                      {t("HomePage.Footer.item2_4")}
                    </a>
                  </li>
                  {siteSettings.laf_doc_url?.value && (
                    <li>
                      <a href={siteSettings.laf_doc_url?.value} target="_blank" rel="noreferrer">
                        {t("HomePage.Footer.item2_5")}
                      </a>
                    </li>
                  )}
                </ul>
              </div>
              <div
                className={
                  darkMode
                    ? "w-1/6 text-lg leading-10 text-lafWhite-700"
                    : "w-1/6 text-lg leading-10 text-[#5E6987]"
                }
              >
                {t("HomePage.Footer.support")}
                <ul
                  className={
                    darkMode ? "leading-10 text-lafWhite-400" : "leading-10 text-[#14171F]"
                  }
                >
                  <li>
                    <a href={`${site_url.laf_github}/issues`} target="_blank" rel="noreferrer">
                      {t("HomePage.Footer.item3_1")}
                    </a>
                  </li>

                  {siteSettings.laf_forum_url?.value && (
                    <li>
                      <a href={siteSettings.laf_forum_url?.value} target="_blank" rel="noreferrer">
                        {t("HomePage.Footer.item3_2")}
                      </a>
                    </li>
                  )}

                  {siteSettings.laf_about_us_url?.value && (
                    <li>
                      <a
                        href={siteSettings.laf_about_us_url?.value}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {t("HomePage.Footer.item3_3")}
                      </a>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
          <div className="flex h-auto flex-row items-center justify-between py-6">
            <div
              className={
                darkMode ? "w-1/2 text-lg text-lafWhite-700" : "w-1/2 text-lg text-[#3C455D]"
              }
            >
              sealos. all rights reserved. © {new Date().getFullYear()}
              <div
                dangerouslySetInnerHTML={{
                  __html: siteSettings.site_footer?.value || "",
                }}
              />
            </div>
            <div className="flex justify-evenly ">
              {siteSettings.laf_status_url?.value && <Status />}
              {siteSettings.laf_wechat_url?.value && (
                <a
                  href={siteSettings.laf_wechat_url?.value}
                  target="_blank"
                  rel="noreferrer"
                  className="mr-1"
                >
                  <WechatIcon fontSize={22} color={darkMode ? "#F6F8F9" : "#3C455D"} />
                </a>
              )}
              {siteSettings.laf_forum_url?.value && (
                <a
                  href={siteSettings.laf_forum_url?.value}
                  target="_blank"
                  rel="noreferrer"
                  className="mr-1"
                >
                  <ForumIcon fontSize={22} color={darkMode ? "#F6F8F9" : "#3C455D"} />
                </a>
              )}
              {siteSettings.laf_discord_url?.value && (
                <a
                  href={siteSettings.laf_discord_url?.value}
                  target="_blank"
                  rel="noreferrer"
                  className="mr-1"
                >
                  <DiscordIcon fontSize={22} color={darkMode ? "#F6F8F9" : "#3C455D"} />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
      <div
        className={
          darkMode
            ? "mt-12 h-auto flex-col divide-y divide-solid divide-gray-200 bg-lafDark-200 px-8 lg:hidden"
            : "mt-12 h-auto flex-col divide-y divide-solid divide-gray-200 bg-[#F9F9F9] px-8 lg:hidden"
        }
      >
        <div className="pb-4 pt-12">
          <img
            src={darkMode ? "/logo_light.png" : "/homepage/logo_text.png"}
            alt="logo"
            width={64}
            height={30}
          />
          <p
            className={
              darkMode
                ? "mt-4 w-full text-base leading-5 text-lafWhite-700"
                : "mt-4 w-full text-base leading-5 text-[#5E6987]"
            }
          >
            {t("HomePage.Footer.laf")}
          </p>

          <div className="mt-4 flex justify-between">
            <div className="w-1/2 text-lg">
              <div
                className={darkMode ? "leading-8 text-lafWhite-700" : "leading-8 text-[#5E6987]"}
              >
                {t("HomePage.Footer.product")}
              </div>
              <ul className="mb-4 leading-8">
                <li>
                  <a href={String(t(`HomePage.LafLink`))}>{t("HomePage.Footer.item1_1")}</a>
                </li>
                <li>
                  <a href={`${site_url.laf_github}/releases`} target="_blank" rel="noreferrer">
                    {t("HomePage.Footer.item1_3")}
                  </a>
                </li>
                <li>
                  <a
                    href="https://marketplace.visualstudio.com/items?itemName=NightWhite.laf-assistant"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {t("HomePage.Footer.item1_4")}
                  </a>
                </li>
                <li>
                  <a href="https://github.com/labring/sealos" target="_blank" rel="noreferrer">
                    {t("HomePage.Footer.item1_2")}
                  </a>
                </li>
              </ul>
              <div className="w-1/2 text-lg">
                <div
                  className={darkMode ? "leading-8 text-lafWhite-700" : "leading-8 text-[#5E6987]"}
                >
                  {t("HomePage.Footer.support")}
                </div>
                <ul className="leading-8">
                  <li>
                    <a href={`${site_url.laf_github}/issues`} target="_blank" rel="noreferrer">
                      {t("HomePage.Footer.item3_1")}
                    </a>
                  </li>

                  {siteSettings.laf_forum_url?.value && (
                    <li>
                      <a href={siteSettings.laf_forum_url?.value} target="_blank" rel="noreferrer">
                        {t("HomePage.Footer.item3_2")}
                      </a>
                    </li>
                  )}

                  {siteSettings.laf_about_us_url?.value && (
                    <li>
                      <a
                        href={siteSettings.laf_about_us_url?.value}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {t("HomePage.Footer.item3_3")}
                      </a>
                    </li>
                  )}
                </ul>
              </div>
            </div>
            <div className="w-1/2 text-lg">
              <div
                className={darkMode ? "leading-8 text-lafWhite-700" : "leading-8 text-[#5E6987]"}
              >
                {t("HomePage.Footer.developer")}
              </div>

              <ul className="leading-8">
                <li>
                  <a
                    href={`${site_url.laf_github}/tree/main/deploy`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {t("HomePage.Footer.item2_1")}
                  </a>
                </li>
                <li>
                  <a href="https://api.laf.dev/" target="_blank" rel="noreferrer">
                    {t("HomePage.Footer.item2_2")}
                  </a>
                </li>
                <li>
                  <a href={site_url.laf_github} target="_blank" rel="noreferrer">
                    {t("HomePage.Footer.item2_4")}
                  </a>
                </li>
                {siteSettings.laf_doc_url?.value && (
                  <li>
                    <a href={siteSettings.laf_doc_url?.value} target="_blank" rel="noreferrer">
                      {t("HomePage.Footer.item2_5")}
                    </a>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 py-6 ">
          <div className={darkMode ? "text-lg text-lafWhite-700" : "text-lg text-[#3C455D]"}>
            laf. all rights reserved. © {new Date().getFullYear()}
            <div
              dangerouslySetInnerHTML={{
                __html: siteSettings.site_footer?.value || "",
              }}
            />
          </div>
          <div className="flex ">
            {siteSettings.laf_wechat_url?.value && (
              <a href={siteSettings.laf_wechat_url?.value} target="_blank" rel="noreferrer">
                <WechatIcon fontSize={28} color={darkMode ? "#F6F8F9" : "#3C455D"} />
              </a>
            )}
            {siteSettings.laf_forum_url?.value && (
              <a href={siteSettings.laf_forum_url?.value} target="_blank" rel="noreferrer">
                <ForumIcon fontSize={28} color={darkMode ? "#F6F8F9" : "#3C455D"} />
              </a>
            )}
            {siteSettings.laf_discord_url?.value && (
              <a href={siteSettings.laf_discord_url?.value} target="_blank" rel="noreferrer">
                <DiscordIcon fontSize={28} color={darkMode ? "#F6F8F9" : "#3C455D"} />
              </a>
            )}
          </div>
          <div>
            <Status />
          </div>
        </div>
      </div>
    </>
  );
};

export default Footer;
