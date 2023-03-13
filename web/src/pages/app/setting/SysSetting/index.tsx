import React from "react";
import { t } from "i18next";

import AppEnvList from "../AppEnvList";
import AppInfoList from "../AppInfoList";

import { TApplicationDetail } from "@/apis/typing";
import SettingModal from "@/pages/app/setting";
export default function SysSetting(props: {
  children: React.ReactElement;
  setApp?: TApplicationDetail;
}) {
  return (
    <SettingModal
      setApp={props.setApp}
      headerTitle={t("SettingPanel.SystemSetting")}
      currentTab="info"
      tabMatch={[
        {
          key: "info",
          name: t("SettingPanel.AppInfo"),
          component: <AppInfoList />,
        },
        {
          key: "env",
          name: t("SettingPanel.AppEnv"),
          component: <AppEnvList />,
        },
      ]}
    >
      {props.children}
    </SettingModal>
  );
}
