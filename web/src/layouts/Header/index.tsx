/****************************
 * laf website header nav
 ***************************/

import { useTranslation } from "react-i18next";
import { FiGithub } from "react-icons/fi";

import UserSetting from "./UserSetting";

import useGlobalStore from "@/pages/globalStore";

export default function Header(props: { size: "sm" | "lg" }) {
  const { userInfo } = useGlobalStore((state) => state);
  const { t } = useTranslation();

  return (
    <div className="flex justify-between px-10 py-4 h-[60px]">
      <div className="flex items-center">
        <img src="/logo_text.png" alt="logo" width={80} className="mr-4" />
        <a
          href="https://github.com/labring/laf"
          className="flex items-center ml-2 p-2 py-1 text-base text-gray-700 hover:text-black bg-white rounded-md"
          target={"_blank"}
          rel="noreferrer"
        >
          <FiGithub />
          <span className="ml-1">{t("star-us-on-github")}</span>
        </a>
      </div>

      <div className="flex items-center">
        {userInfo?.profile ? (
          <>
            <UserSetting
              name={userInfo?.profile?.name}
              avatar={userInfo?.profile?.avatar}
              width={"24px"}
            />
          </>
        ) : null}
      </div>
    </div>
  );
}
