import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { WarningTwoIcon } from "@chakra-ui/icons";
import { useColorMode } from "@chakra-ui/react";
import clsx from "clsx";

import SettingModal from "@/pages/app/setting";
import useTabMatch from "@/pages/app/setting/UserSetting/useTabMatch";
import useGlobalStore from "@/pages/globalStore";
import useSiteSettingStore from "@/pages/siteSetting";

export default function Warn() {
  const { t } = useTranslation();
  const { userInfo, showError } = useGlobalStore((state) => state);
  const [openModal, setOpenModal] = useState(false);
  const { siteSettings } = useSiteSettingStore((state) => state);
  const { colorMode } = useColorMode();
  const darkMode = colorMode === "dark";

  return (
    <div
      className={clsx(
        "absolute left-1/2 top-10 z-10 flex h-16 translate-x-[-50%] items-center justify-between rounded-lg px-4 text-lg drop-shadow-md",
        darkMode ? "bg-gray-800" : "bg-white",
      )}
    >
      <span className="flex items-center pr-9">
        <WarningTwoIcon className="mr-2 !text-error-600" />
        <p dangerouslySetInnerHTML={{ __html: siteSettings.id_verify?.metadata.message }} />
      </span>
      <p
        className="cursor-pointer font-semibold text-[#219BF4]"
        onClick={() => {
          if (userInfo?.phone) {
            const w = window.open("about:blank");
            w!.location.href = `${
              siteSettings.id_verify?.metadata.authenticateSite
            }?token=${localStorage.getItem("token")}`;
          } else {
            showError(t("UserInfo.PleaseBindPhone"));
            setOpenModal(true);
          }
        }}
      >
        {t("UserInfo.GotoAuth")}
      </p>

      <SettingModal
        headerTitle={t("SettingPanel.UserCenter")}
        currentTab={"user-info"}
        tabMatch={useTabMatch("user")}
        openModal={openModal}
        setOpenModal={setOpenModal}
      />
    </div>
  );
}
