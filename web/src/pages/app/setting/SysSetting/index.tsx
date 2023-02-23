import React from "react";
import { MdOutlineArticle } from "react-icons/md";
import { t } from "i18next";

import FileTypeIcon from "@/components/FileTypeIcon";

import AppEnvList from "../AppEnvList";
import AppInfoList from "../AppInfoList";

import { TApplication } from "@/apis/typing";
import SettingModal from "@/pages/app/setting";
export default function SysSetting(props: { children: React.ReactElement; setApp?: TApplication }) {
  return (
    <SettingModal
      setApp={props.setApp}
      headerTitle={t("SettingPanel.SystemSetting")}
      tabMatch={[
        {
          key: "info",
          name: t("SettingPanel.AppInfo"),
          icon: <MdOutlineArticle />,
          component: <AppInfoList />,
        },
        {
          key: "env",
          name: t("SettingPanel.AppEnv"),
          icon: <FileTypeIcon type="locked" />,
          component: <AppEnvList />,
        },
      ]}
    >
      {props.children}
    </SettingModal>
  );
}
