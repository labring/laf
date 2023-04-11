import { useTranslation } from "react-i18next";

type Props = {};

const Footer = (props: Props) => {
  const { t } = useTranslation();

  return (
    <>
      <div className="hidden justify-center bg-[#F9F9F9] lg:flex">
        <div className=" w-full max-w-[1200px] flex-col divide-y divide-solid divide-gray-200">
          <div className="py-[60px]">
            <div className="flex justify-between">
              <div className="w-1/2">
                <img
                  src="/homepage/logo_text.png"
                  alt="logo"
                  width={64}
                  height={30}
                  className="mt-4"
                />
                <p className="mt-8 w-full max-w-[380px] text-base leading-5 text-[#5E6987]">
                  {t("HomePage.Footer.laf")}
                </p>
              </div>

              <div className="w-1/6 text-lg leading-10 text-[#5E6987]">
                {t("HomePage.Footer.product")}
                <ul className="leading-10 text-[#14171F]">
                  <li>
                    <a href={String(t(`HomePage.LafLink`))}>{t("HomePage.Footer.item1_1")}</a>
                  </li>
                  <li>
                    <a
                      href="https://github.com/labring/laf/releases"
                      target="_blank"
                      rel="noreferrer"
                    >
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
              <div className="w-1/6 text-lg leading-10 text-[#5E6987]">
                {t("HomePage.Footer.developer")}
                <ul className="leading-10 text-[#14171F]">
                  <li>
                    <a href="#" target="_blank">
                      {t("HomePage.Footer.item2_1")}
                    </a>
                  </li>
                  <li>
                    <a href="https://api.laf.dev/" target="_blank" rel="noreferrer">
                      {t("HomePage.Footer.item2_2")}
                    </a>
                  </li>
                  {/* <li>
                    <a href="#" target="_blank">
                      {t('Footer.item2_3')}
                    </a>
                  </li> */}
                  <li>
                    <a href="https://github.com/labring/laf" target="_blank" rel="noreferrer">
                      {t("HomePage.Footer.item2_4")}
                    </a>
                  </li>
                  <li>
                    <a href={String(t("HomePage.DocsLink"))} target="_blank" rel="noreferrer">
                      {t("HomePage.Footer.item2_5")}
                    </a>
                  </li>
                </ul>
              </div>
              <div className="w-1/6 text-lg leading-10 text-[#5E6987]">
                {t("HomePage.Footer.support")}
                <ul className="leading-10 text-[#14171F]">
                  <li>
                    <a
                      href="https://github.com/labring/laf/issues"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {t("HomePage.Footer.item3_1")}
                    </a>
                  </li>

                  <li>
                    <a href="https://forum.laf.run/" target="_blank" rel="noreferrer">
                      {t("HomePage.Footer.item3_2")}
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="flex h-auto flex-row items-center justify-between py-6">
            <div className="w-1/2 text-lg text-[#3C455D]">
              laf. all rights reserved. © {new Date().getFullYear()}
            </div>
            <div className="flex w-36 justify-evenly">
              <a
                href="https://w4mci7-images.oss.laf.run/wechat.png"
                target="_blank"
                rel="noreferrer"
              >
                <img src="/homepage/weixinicon.svg" alt="weixin" width={24} height={24} />
              </a>
              <a href="https://forum.laf.run" target="_blank" rel="noreferrer">
                <img src="/homepage/forumicon.svg" alt="qq" width={24} height={24} />
              </a>
              <a href="https://discord.gg/6VhVrsaS" target="_blank" rel="noreferrer">
                <img src="/homepage/discord_hover.svg" alt="game" width={24} height={24} />
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-12 h-auto  flex-col divide-y divide-solid divide-gray-200 bg-[#F9F9F9] px-8 lg:hidden">
        <div className="pb-4 pt-12">
          <img src="/homepage/logo_text.png" alt="logo" width={64} height={30} />
          <p className="mt-4 w-full text-base leading-5 text-[#5E6987]">
            {t("HomePage.Footer.laf")}
          </p>

          <div className="mt-4 flex justify-between">
            <div className="w-1/2 text-lg text-[#14171F]">
              <div className="leading-8 text-[#5E6987]">{t("HomePage.Footer.product")}</div>
              <ul className="leading-8">
                <li>
                  <a href={String(t(`HomePage.LafLink`))}>{t("HomePage.Footer.item1_1")}</a>
                </li>
                <li>
                  <a
                    href="https://github.com/labring/laf/releases"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {t("HomePage.Footer.item1_2")}
                  </a>
                </li>
              </ul>
              <div className="w-1/2 text-lg text-[#14171F]">
                <div className="text-[#5E6987 leading-8 text-[#5E6987]">
                  {t("HomePage.Footer.support")}
                </div>
                <ul className="leading-8">
                  <li>
                    <a
                      href="https://github.com/labring/laf/issues"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {t("HomePage.Footer.item3_1")}
                    </a>
                  </li>

                  <li>
                    <a href="https://forum.laf.run/" target="_blank" rel="noreferrer">
                      {t("HomePage.Footer.item3_2")}
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="w-1/2 text-lg text-[#14171F]">
              <div className="leading-8 text-[#5E6987]">Developers</div>

              <ul className="leading-8">
                <li>
                  <a href="#" target="_blank">
                    {t("HomePage.Footer.item2_1")}
                  </a>
                </li>
                <li>
                  <a href="https://api.laf.dev/" target="_blank" rel="noreferrer">
                    {t("HomePage.Footer.item2_2")}
                  </a>
                </li>
                {/* <li>
                  <a href="#" target="_blank">
                    {t('Footer.item2_3')}
                  </a>
                </li> */}
                <li>
                  <a href="https://github.com/labring/laf" target="_blank" rel="noreferrer">
                    {t("HomePage.Footer.item2_4")}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex h-auto flex-col gap-6 py-6 ">
          <div className="text-lg text-[#3C455D]">
            laf. all rights reserved. © {new Date().getFullYear()}
          </div>
          <div className="ml-[-10px] flex w-32 justify-around">
            <a href="https://w4mci7-images.oss.laf.run/wechat.png" target="_blank" rel="noreferrer">
              <img src="/homepage/weixinicon.svg" alt="weixin" width={24} height={24} />
            </a>
            <a href="https://forum.laf.run" target="_blank" rel="noreferrer">
              <img src="/homepage/forumicon.svg" alt="qq" width={24} height={24} />
            </a>
            <a href="https://discord.gg/6VhVrsaS" target="_blank" rel="noreferrer">
              <img src="/homepage/discord_hover.svg" alt="game" width={24} height={24} />
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default Footer;
