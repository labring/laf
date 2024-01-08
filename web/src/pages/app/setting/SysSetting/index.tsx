import React from "react";
import { useMemo } from "react";
import { t } from "i18next";

import {
  CommonSettingIcon,
  DomainIcon,
  ENVIcon,
  MonitorIcon,
  TextIcon,
} from "@/components/CommonIcon";
import { APP_SETTING_KEY } from "@/constants";

import AppEnvList from "./AppEnvList";
import AppInfoList from "./AppInfoList";
import AppMonitor from "./AppMonitor";
import CommonSetting from "./CommonSetting";
import CustomDomain from "./CustomDomain";
import DatabaseMonitor from "./DatabaseMonitor";

import { TApplicationDetail } from "@/apis/typing";
import SettingModal from "@/pages/app/setting";
import useGlobalStore from "@/pages/globalStore";

export default function SysSetting(props: {
  children: React.ReactElement;
  setApp?: TApplicationDetail;
  currentTab?: string;
}) {
  const { currentApp } = useGlobalStore();
  const dedicatedDatabaseLimitCPU = currentApp.bundle.resource.dedicatedDatabase?.limitCPU;

  const monitorItems = useMemo(() => {
    const items = [
      {
        key: APP_SETTING_KEY.MONITOR_RUNTIME,
        name: t("SettingPanel.RuntimeMonitor"),
        component: <AppMonitor />,
        icon: <MonitorIcon boxSize={4} />,
      },
    ];
    if (dedicatedDatabaseLimitCPU) {
      items.push({
        key: APP_SETTING_KEY.MONITOR_DATABASE,
        name: t("SettingPanel.DatabaseMonitor"),
        component: <DatabaseMonitor />,
        icon: <MonitorIcon boxSize={4} />,
      });
    }
    return items;
  }, [dedicatedDatabaseLimitCPU]);

  return (
    <SettingModal
      setApp={props.setApp}
      headerTitle={t("SettingPanel.Setting")}
      currentTab={props.currentTab || "info"}
      tabMatch={[
        {
          title: t("SettingPanel.SystemSetting"),
          items: [
            {
              key: APP_SETTING_KEY.INFO,
              name: t("SettingPanel.AppInfo"),
              component: <AppInfoList />,
              icon: <TextIcon boxSize={4} />,
            },
            {
              key: APP_SETTING_KEY.ENV,
              name: t("SettingPanel.AppEnv"),
              component: <AppEnvList />,
              icon: <ENVIcon fontSize={16} />,
            },
            {
              key: APP_SETTING_KEY.DOMAIN,
              name: t("SettingPanel.Domain"),
              component: <CustomDomain />,
              icon: <DomainIcon boxSize={4} />,
            },
          ],
        },
        {
          title: t("SettingPanel.MonitorSetting"),
          items: monitorItems,
        },
        {
          title: t("SettingPanel.ClientSetting"),
          items: [
            {
              key: APP_SETTING_KEY.COMMON,
              name: t("SettingPanel.CommonSetting"),
              component: <CommonSetting />,
              icon: <CommonSettingIcon boxSize={4} />,
            },
          ],
        },
      ]}
    >
      {props.children}
    </SettingModal>
  );
}
