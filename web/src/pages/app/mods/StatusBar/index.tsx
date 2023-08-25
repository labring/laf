import { useTranslation } from "react-i18next";
import { HStack } from "@chakra-ui/react";
import clsx from "clsx";

import ColorModeSwitch from "@/components/ColorModeSwitch";
import LanguageSwitch from "@/components/LanguageSwitch";
import Panel from "@/components/Panel";

import Icons from "../SideBar/Icons";

import MonitorBar from "./MonitorBar";

import SysSetting from "@/pages/app/setting/SysSetting";
import useGlobalStore from "@/pages/globalStore";
import CreateAppModal from "@/pages/home/mods/CreateAppModal";
import StatusBadge from "@/pages/home/mods/StatusBadge";

function StatusBar() {
  const { t } = useTranslation();
  const { currentApp } = useGlobalStore((state) => state);

  return (
    <Panel className="!mt-1 !flex-row justify-between">
      <HStack spacing={2}>
        <LanguageSwitch className="!-space-x-1 !text-[12px] !text-grayModern-700" size="14px" />
        <ColorModeSwitch className="pr-2 !text-grayModern-700" fontSize={13} />
        <div>
          {t("StatusBar.CurrentApplication")}: {currentApp?.name}
        </div>
        <SysSetting currentTab="info">
          <div className="cursor-pointer">
            <Icons type="info" />
          </div>
        </SysSetting>
        <StatusBadge statusConditions={currentApp?.phase} state={currentApp?.state} />
      </HStack>
      <HStack spacing={4}>
        <MonitorBar />
        <div className={clsx("mt-1")}>
          <CreateAppModal application={currentApp as any} isCurrentApp type="change">
            <a className="ml-2 text-primary-700" href="/edit">
              {t("Change")}
            </a>
          </CreateAppModal>
        </div>
      </HStack>
    </Panel>
  );
}

export default StatusBar;
