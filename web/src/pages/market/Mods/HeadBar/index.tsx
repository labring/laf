import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useColorMode } from "@chakra-ui/react";
import clsx from "clsx";

import { MarketIcon } from "@/components/CommonIcon";
import { COLOR_MODE } from "@/constants";
// import useGlobalStore from "@/pages/globalStore";

export default function HeadBar() {
  // const { userInfo } = useGlobalStore((state) => state);
  // console.log(userInfo);
  const navigate = useNavigate();
  const { colorMode } = useColorMode();
  const darkMode = colorMode === COLOR_MODE.dark;
  const { t } = useTranslation();

  return (
    <div
      className={clsx(
        "flex h-16 w-full justify-between ",
        darkMode ? "bg-gray-900" : "bg-[#f5f6f8]",
      )}
    >
      <div className="flex items-center pl-8">
        <img
          src={darkMode ? "/logo_light.png" : "/logo_text.png"}
          alt="logo"
          className="w-20 cursor-pointer"
          onClick={() => {
            navigate("/");
          }}
        />
        <div
          className="mx-4 flex cursor-pointer items-center border-l-2 border-grayModern-400 px-4 text-xl"
          onClick={() => {
            navigate("/market");
          }}
        >
          <MarketIcon color={"#5A646E"} />
          <span className="pl-2 text-grayModern-600">{t("market.market")}</span>
        </div>
      </div>

      <div className="flex items-center pr-8">
        {/* <span className="text-lg">新建函数模板</span> */}
        <a href="/market/mine">
          <img src="/logo.png" alt="logo" className="w-10"></img>
        </a>
      </div>
    </div>
  );
}
