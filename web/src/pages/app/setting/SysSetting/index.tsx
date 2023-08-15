import React from "react";
import { t } from "i18next";

import { DomainIcon, ENVIcon, MonitorIcon, TextIcon } from "@/components/CommonIcon";
import { APP_SETTING_KEY } from "@/constants";

import AppEnvList from "../AppEnvList";
import AppInfoList from "../AppInfoList";
import AppMonitor from "../AppMonitor";
import CustomDomain from "../CustomDomain";

import { TApplicationDetail } from "@/apis/typing";
import SettingModal from "@/pages/app/setting";
export default function SysSetting(props: {
  children: React.ReactElement;
  setApp?: TApplicationDetail;
  currentTab?: string;
}) {
  return (
    <SettingModal
      setApp={props.setApp}
      headerTitle={t("SettingPanel.SystemSetting")}
      currentTab={props.currentTab || "info"}
      tabMatch={[
        {
          key: APP_SETTING_KEY.INFO,
          name: t("SettingPanel.AppInfo"),
          component: <AppInfoList />,
          icon: <TextIcon boxSize={4} />,
        },
        {
          key: "monitor",
          name: t("SettingPanel.AppMonitor"),
          component: <AppMonitor />,
          icon: <MonitorIcon boxSize={4} />,
        },
        {
          key: APP_SETTING_KEY.ENV,
          name: t("SettingPanel.AppEnv"),
          component: <AppEnvList />,
          icon: <ENVIcon boxSize={4} />,
        },
        {
          key: APP_SETTING_KEY.DOMAIN,
          name: t("SettingPanel.Domain"),
          component: <CustomDomain />,
          icon: <DomainIcon boxSize={4} />,
        },
      ]}
    >
      {props.children}
    </SettingModal>
  );
}
