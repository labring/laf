import { useTranslation } from "react-i18next";
import { HStack, useColorMode } from "@chakra-ui/react";
import clsx from "clsx";

import ColorModeSwitch from "@/components/ColorModeSwitch";
import { TextIcon } from "@/components/CommonIcon";
import LanguageSwitch from "@/components/LanguageSwitch";
import Panel from "@/components/Panel";

import Icons from "../SideBar/Icons";

import LogsModal from "./LogsModal";
import LSPBar from "./LSPBar";
import MonitorBar from "./MonitorBar";

import SysSetting from "@/pages/app/setting/SysSetting";
import useGlobalStore from "@/pages/globalStore";
import CreateAppModal from "@/pages/home/mods/CreateAppModal";
import StatusBadge from "@/pages/home/mods/StatusBadge";

function StatusBar() {
  const { t } = useTranslation();
  const { currentApp } = useGlobalStore((state) => state);
  const darkMode = useColorMode().colorMode === "dark";

  return (
    <Panel className="!mt-1 !flex-row justify-between">
      <HStack spacing={2}>
        <LanguageSwitch
          className={clsx("!-space-x-1 !text-[12px]", darkMode ? "" : "!text-grayModern-700")}
          size="14px"
        />
        <ColorModeSwitch
          className={clsx("pr-2", darkMode ? "" : "!text-grayModern-700")}
          fontSize={13}
        />
        <div>
          {t("StatusBar.CurrentApplication")}: {currentApp?.name}
        </div>
        <SysSetting currentTab="info">
          <div className="cursor-pointer">
            <Icons type="info" />
          </div>
        </SysSetting>
        <StatusBadge
          className="!bg-transparent"
          statusConditions={currentApp?.phase}
          state={currentApp?.state}
        />
        <LSPBar />
      </HStack>
      <HStack spacing={4}>
        <LogsModal>
          <div
            className={clsx("flex cursor-pointer space-x-1", darkMode ? "" : "text-grayModern-600")}
          >
            <span className="flex items-center">
              <TextIcon />
            </span>
            <span>{t("Logs.logs")}</span>
          </div>
        </LogsModal>
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
