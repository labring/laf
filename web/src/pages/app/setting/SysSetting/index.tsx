import React from "react";
import { t } from "i18next";

import { DomainIcon, ENVIcon, TextIcon } from "@/components/CommonIcon";

import AppEnvList from "../AppEnvList";
import AppInfoList from "../AppInfoList";
import CustomDomain from "../CustomDomain";

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
          icon: <TextIcon boxSize={4} />,
        },
        {
          key: "env",
          name: t("SettingPanel.AppEnv"),
          component: <AppEnvList />,
          icon: <ENVIcon boxSize={4} />,
        },
        {
          key: "domain",
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
